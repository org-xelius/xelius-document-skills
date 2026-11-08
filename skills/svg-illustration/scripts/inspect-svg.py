#!/usr/bin/env python3
"""Inspect SVG syntax, references, and optional renderer-measured geometry."""
import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "http://www.w3.org/2000/svg"
DRAWABLE = {"text", "rect", "circle", "ellipse", "path", "line", "polyline", "polygon", "image", "use", "foreignObject"}
NON_RENDERED = {"defs", "symbol", "clipPath", "mask", "marker", "pattern", "linearGradient", "radialGradient"}


def local(tag):
    return tag.rsplit("}", 1)[-1]


def number_list(value):
    values = [float(item) for item in re.split(r"[\s,]+", value.strip()) if item]
    if not all(math.isfinite(item) for item in values):
        raise ValueError("Coordinates must be finite.")
    return values


def inspect(args):
    checks, limitations = [], []
    report = {"schemaVersion": "1.0", "artifact": str(args.asset), "scope": "structural-and-measured-geometry" if args.geometry else "structural", "checks": checks, "limitations": limitations}

    def add(check_id, status, message, location=None):
        record = {"id": check_id, "status": status, "message": message}
        if location:
            record["location"] = location
        checks.append(record)

    try:
        source = args.asset.read_text(encoding="utf8")
        if re.search(r"<!\s*(DOCTYPE|ENTITY)\b", source, re.I):
            raise ValueError("Document type and entity declarations are prohibited.")
        root = ET.fromstring(source)
        if root.tag != f"{{{SVG_NS}}}svg":
            raise ValueError("Root must be an svg element in the SVG namespace.")
        add("svg.xml", "pass", "XML parsed successfully with an SVG root.")
    except (OSError, UnicodeError, ET.ParseError, ValueError) as error:
        add("svg.xml", "fail", str(error))
        report["status"] = "repair-required"
        return report

    viewbox = None
    try:
        viewbox = number_list(root.attrib.get("viewBox", ""))
        if len(viewbox) != 4 or viewbox[2] <= 0 or viewbox[3] <= 0:
            raise ValueError("viewBox needs four finite numbers with positive width and height.")
        add("svg.viewbox", "pass", "Explicit viewBox has valid dimensions.")
    except ValueError as error:
        viewbox = None
        add("svg.viewbox", "fail", str(error))
    for name in ("title", "desc"):
        found = root.find(f"{{{SVG_NS}}}{name}")
        valid = found is not None and "".join(found.itertext()).strip()
        add(f"svg.{name}", "pass" if valid else "fail", f"Accessible {name} is {'present' if valid else 'missing or empty'}.")

    ids, pending_refs, candidates = {}, [], []
    parents = {child: parent for parent in root.iter() for child in parent}
    for element in root.iter():
        tag, element_id = local(element.tag), element.attrib.get("id")
        if element_id:
            if element_id in ids:
                add("svg.ids", "fail", f"Duplicate ID {element_id}.", element_id)
            ids[element_id] = element
        if tag == "script" or any(local(name).lower().startswith("on") for name in element.attrib):
            add("svg.active-content", "fail", "Scripts and event handlers are prohibited.", element_id)
        for name, value in element.attrib.items():
            if local(name) == "href":
                if value.startswith("#"):
                    pending_refs.append((value[1:], element_id))
                elif value.strip():
                    add("svg.external-resource", "fail", "External and embedded resources require a separate reviewed production path.", element_id)
            for _, target in re.findall(r"url\(\s*(['\"]?)(.*?)\1\s*\)", value):
                if target.startswith("#"):
                    pending_refs.append((target[1:], element_id))
                else:
                    add("svg.external-resource", "fail", "External paint or filter resources are prohibited.", element_id)
            if local(name) in ("aria-labelledby", "aria-describedby"):
                pending_refs.extend((ref, element_id) for ref in value.split())
        if tag == "style":
            css = "".join(element.itertext())
            if re.search(r"@import", css, re.I):
                add("svg.external-style", "fail", "External CSS resources are prohibited.")
            for _, target in re.findall(r"url\(\s*(['\"]?)(.*?)\1\s*\)", css):
                if target.startswith("#"):
                    pending_refs.append((target[1:], element_id))
                else:
                    add("svg.external-style", "fail", "External CSS resources are prohibited.")
        if tag == "text":
            text = " ".join("".join(element.itertext()).split())
            if len(text) > 70 and element.find(f"{{{SVG_NS}}}tspan") is None:
                add("svg.label-length", "warning", "Long single-line label: confirm rendered bounds; character length alone is not a defect.", element_id)
        ancestor, skip = element, False
        while ancestor is not None:
            if local(ancestor.tag) in NON_RENDERED or ancestor.attrib.get("data-allow-overflow") == "true":
                skip = True
                break
            ancestor = parents.get(ancestor)
        if tag in DRAWABLE and not skip:
            candidates.append(element)
    for ref, owner in pending_refs:
        if ref not in ids:
            add("svg.references", "fail", f"Reference points to missing ID {ref}.", owner)
    if not any(check["id"] in ("svg.ids", "svg.references") and check["status"] == "fail" for check in checks):
        add("svg.references", "pass", "IDs are unique and fragment references resolve.")

    if args.geometry and viewbox and not any(check["status"] == "fail" for check in checks):
        renderer = args.inkscape or shutil.which("inkscape")
        if not renderer and Path("/Applications/Inkscape.app/Contents/MacOS/inkscape").is_file():
            renderer = "/Applications/Inkscape.app/Contents/MacOS/inkscape"
        if not renderer:
            limitations.append("Inkscape is unavailable; renderer-measured bounds were not checked.")
        else:
            root.set("width", str(viewbox[2]))
            root.set("height", str(viewbox[3]))
            counter = 0
            for element in candidates:
                if not element.attrib.get("id"):
                    counter += 1
                    generated = f"xelius-inspect-{counter}"
                    while generated in ids:
                        counter += 1
                        generated = f"xelius-inspect-{counter}"
                    element.set("id", generated)
                    ids[generated] = element
            ET.register_namespace("", SVG_NS)
            try:
                with tempfile.TemporaryDirectory(prefix="xelius-svg-") as temporary:
                    probe = Path(temporary) / "probe.svg"
                    ET.ElementTree(root).write(probe, encoding="utf-8", xml_declaration=True)
                    result = subprocess.run([renderer, str(probe), "--query-all"], capture_output=True, text=True, timeout=30)
                if result.returncode != 0:
                    raise RuntimeError(f"Inkscape query failed (exit {result.returncode}): {result.stderr.strip()[:240]}")
                boxes = {}
                for line in result.stdout.splitlines():
                    fields = line.split(",")
                    if len(fields) == 5:
                        try:
                            boxes[fields[0]] = [float(item) for item in fields[1:]]
                        except ValueError:
                            continue
                measured = 0
                for element in candidates:
                    element_id = element.attrib["id"]
                    if element_id not in boxes:
                        if local(element.tag) == "text" and "".join(element.itertext()).strip():
                            limitations.append(f"No renderer bounds returned for text {element_id}; inspect hidden text and font availability.")
                        continue
                    measured += 1
                    x, y, width, height = boxes[element_id]
                    if not all(math.isfinite(value) for value in boxes[element_id]):
                        add("svg.bounds", "fail", "Renderer returned non-finite bounds.", element_id)
                        continue
                    inset = args.safe_inset if local(element.tag) == "text" else 0
                    if x < inset - .1 or y < inset - .1 or x + width > viewbox[2] - inset + .1 or y + height > viewbox[3] - inset + .1:
                        add("svg.bounds", "fail", f"Rendered bounds {x:g},{y:g},{width:g},{height:g} exceed the artboard safe area.", element_id)
                    if element.attrib.get("data-safe-box"):
                        try:
                            sx, sy, sw, sh = number_list(element.attrib["data-safe-box"])
                            sx -= viewbox[0]
                            sy -= viewbox[1]
                            if sw <= 0 or sh <= 0:
                                raise ValueError("Safe box width and height must be positive.")
                            if x < sx - .1 or y < sy - .1 or x + width > sx + sw + .1 or y + height > sy + sh + .1:
                                add("svg.container-bounds", "fail", "Rendered label exceeds its declared data-safe-box.", element_id)
                        except ValueError:
                            add("svg.container-bounds", "fail", "data-safe-box must contain x y width height in viewBox coordinates.", element_id)
                add("svg.measured-geometry", "pass", f"Measured {measured} drawable elements with Inkscape.")
            except (OSError, RuntimeError, subprocess.TimeoutExpired) as error:
                limitations.append(str(error))

    if args.placed_width_mm:
        if not viewbox:
            limitations.append("Placed-size readability requires a valid viewBox.")
        else:
            add("svg.placed-size", "warning", f"Inspect a {args.placed_width_mm:g} mm-wide render at reading size; bounds measurements cannot establish readability or contrast.")
            for element in candidates:
                if local(element.tag) != "text":
                    continue
                match = re.fullmatch(r"\s*([0-9.]+)(px|pt)?\s*", element.attrib.get("font-size", ""))
                if not match:
                    continue
                size = float(match[1]) * (96 / 72 if match[2] == "pt" else 1)
                placed_pt = size * args.placed_width_mm * 72 / (25.4 * viewbox[2])
                if args.min_font_pt and placed_pt < args.min_font_pt:
                    add("svg.font-size", "warning", f"Authored text scales to about {placed_pt:.1f} pt, below the {args.min_font_pt:g} pt contract; confirm transforms and font rendering.", element.attrib.get("id"))

    report["status"] = "repair-required" if any(check["status"] == "fail" for check in checks) else "limited" if limitations else "pass"
    report["visualInspection"] = "required: inspect standalone render and final integration"
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("asset", type=Path)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--strict", action="store_true", help="Fail on missing requested checks as well as structural/geometry errors.")
    parser.add_argument("--geometry", action="store_true", help="Measure bounds with Inkscape.")
    parser.add_argument("--inkscape", help="Explicit Inkscape executable path.")
    parser.add_argument("--safe-inset", type=float, default=0, help="Text inset in viewBox units.")
    parser.add_argument("--placed-width-mm", type=float)
    parser.add_argument("--min-font-pt", type=float)
    args = parser.parse_args()
    numeric = [value for value in [args.safe_inset, args.placed_width_mm, args.min_font_pt] if value is not None]
    if not all(math.isfinite(value) for value in numeric) or args.safe_inset < 0 or (args.placed_width_mm is not None and args.placed_width_mm <= 0) or (args.min_font_pt is not None and args.min_font_pt <= 0):
        parser.error("Safe inset must be nonnegative; placed width and minimum font size must be positive.")
    report = inspect(args)
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        for check in report["checks"]:
            if check["status"] != "pass":
                print(f"{check['status'].upper()} {check['id']}: {check['message']}", file=sys.stderr)
        for limitation in report["limitations"]:
            print(f"LIMITED {limitation}", file=sys.stderr)
        print(f"SVG {report['scope']} status: {report['status']}. Render and target-integration visual checks remain required.")
    return 1 if report["status"] == "repair-required" or (args.strict and report["status"] == "limited") else 0


if __name__ == "__main__":
    sys.exit(main())
