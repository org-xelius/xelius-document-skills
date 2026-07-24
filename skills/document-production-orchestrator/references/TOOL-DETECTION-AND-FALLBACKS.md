# Tool Detection and Fallbacks

Run `node ../scripts/detect-environment.mjs --json` from this reference directory, or `node scripts/detect-environment.mjs --json` from the skill directory, and store the result in the project manifest.

| Capability | Preferred | Fallback | Limitation to report |
| --- | --- | --- | --- |
| HTML-to-PDF | Playwright plus Chromium | system Chromium print-to-PDF; documented manual browser print | paged-media and link behavior may differ |
| PPTX build | supported programmable JS library | another mature installed library; manual template editing only if authorized | editability or component support |
| PPTX render | LibreOffice | office-suite export; user-rendered preview | visual QA remains limited until renders exist |
| PDF render | Poppler | ImageMagick or Ghostscript | colour and transparency differences |
| SVG raster | Inkscape | browser screenshot; ImageMagick | filters and fonts may differ |
| Contact sheet | ImageMagick | browser or canvas-based compositor | performance only |
| PDF inspection | Poppler and Ghostscript tools | language library metadata inspection | font, image, colour, or link checks may be partial |
| Media conversion | ffmpeg | native image tools | format coverage |

Never fail solely because a preferred tool is absent when a safe fallback exists. Never convert a missing check into a pass.
