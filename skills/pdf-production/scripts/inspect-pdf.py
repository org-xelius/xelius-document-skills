#!/usr/bin/env python3
"""Read PDF structure without modifying the file. Requires pypdf."""
import hashlib
import json
import re
import sys

try:
    from pypdf import PdfReader
except ImportError:
    print(json.dumps({"available": False, "error": "Install pypdf in the selected Python environment for structural PDF inspection."}))
    sys.exit(3)

try:
    reader = PdfReader(sys.argv[1])
    root = reader.trailer["/Root"]
    mark_info = root.get("/MarkInfo", {})
    mark_info = mark_info.get_object() if hasattr(mark_info, "get_object") else mark_info
    metadata = {str(key).lstrip("/").lower(): str(value) for key, value in (reader.metadata or {}).items()}
    def outline_records(items):
        records = []
        for item in items:
            if isinstance(item, list):
                records.extend(outline_records(item))
            else:
                records.append({"title": str(item.get("/Title", "")), "page": reader.get_destination_page_number(item) + 1})
        return records
    pages = []
    links = []
    page_numbers = {page.indirect_reference.idnum: number for number, page in enumerate(reader.pages, 1) if page.indirect_reference}
    def link_target(destination):
        if isinstance(destination, list) and destination:
            first = destination[0]
            page_number = page_numbers.get(getattr(first, "idnum", None))
            return f"page:{page_number}:" + ":".join(str(item) for item in destination[1:]) if page_number else str(destination)
        return str(destination or "")
    for number, page in enumerate(reader.pages, 1):
        box = page.mediabox
        pages.append({"page": number, "width": round(float(box.width), 3), "height": round(float(box.height), 3), "rotation": page.rotation})
        for reference in page.get("/Annots", []):
            annotation = reference.get_object()
            if annotation.get("/Subtype") != "/Link":
                continue
            action = annotation.get("/A", {})
            action = action.get_object() if hasattr(action, "get_object") else action
            destination = action.get("/URI") or action.get("/D") or annotation.get("/Dest")
            links.append({"page": number, "kind": "external" if action.get("/URI") else "internal", "target": link_target(destination)})
    text = "".join(re.sub(r"\s+", "", page.extract_text() or "") for page in reader.pages)
    bookmarks = outline_records(reader.outline)
    print(json.dumps({
        "available": True,
        "encrypted": reader.is_encrypted,
        "metadata": metadata,
        "language": str(root.get("/Lang", "")),
        "tagged": bool(root.get("/StructTreeRoot")) and bool(mark_info.get("/Marked")),
        "bookmarkCount": len(bookmarks),
        "bookmarks": bookmarks,
        "links": links,
        "pages": pages,
        "textLength": len(text),
        "textHash": hashlib.sha256(text.encode("utf-8")).hexdigest()
    }))
except Exception as error:
    print(json.dumps({"available": False, "error": str(error)}))
    sys.exit(1)
