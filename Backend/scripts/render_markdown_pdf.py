from __future__ import annotations

import re
import sys
import textwrap
from pathlib import Path


PAGE_WIDTH = 612
PAGE_HEIGHT = 792
LEFT = 54
RIGHT = 54
TOP = 54
BOTTOM = 54
BODY_SIZE = 10
LINE_HEIGHT = 14


def pdf_escape(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .encode("latin-1", "replace")
        .decode("latin-1")
    )


def wrap_line(text: str, max_chars: int) -> list[str]:
    if not text:
        return [""]
    return textwrap.wrap(
        text,
        width=max_chars,
        break_long_words=False,
        replace_whitespace=False,
    ) or [""]


def markdown_to_lines(markdown: str) -> list[tuple[str, int, str]]:
    rows: list[tuple[str, int, str]] = []
    in_code = False

    for raw in markdown.splitlines():
        line = raw.rstrip()

        if line.startswith("```"):
            in_code = not in_code
            rows.append(("", BODY_SIZE, "regular"))
            continue

        if in_code:
            rows.append((f"    {line}", 8, "mono"))
            continue

        if not line:
            rows.append(("", BODY_SIZE, "regular"))
            continue

        if line.startswith("# "):
            rows.append((line[2:].strip(), 20, "bold"))
            rows.append(("", BODY_SIZE, "regular"))
            continue

        if line.startswith("## "):
            rows.append(("", BODY_SIZE, "regular"))
            rows.append((line[3:].strip(), 15, "bold"))
            continue

        if line.startswith("### "):
            rows.append(("", BODY_SIZE, "regular"))
            rows.append((line[4:].strip(), 12, "bold"))
            continue

        if line.startswith("- "):
            rows.append((f"- {line[2:].strip()}", BODY_SIZE, "regular"))
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", line)
        if numbered:
            rows.append((f"{numbered.group(1)}. {numbered.group(2)}", BODY_SIZE, "regular"))
            continue

        rows.append((line, BODY_SIZE, "regular"))

    return rows


def paginate(rows: list[tuple[str, int, str]]) -> list[list[tuple[str, int, str]]]:
    pages: list[list[tuple[str, int, str]]] = [[]]
    y = PAGE_HEIGHT - TOP

    for text, size, style in rows:
        max_chars = 94 if style != "mono" else 82
        if size >= 15:
            max_chars = 64
        elif size >= 12:
            max_chars = 78

        wrapped = wrap_line(text, max_chars)
        for index, part in enumerate(wrapped):
            row_size = size if index == 0 else min(size, BODY_SIZE)
            row_height = max(LINE_HEIGHT, row_size + 4)
            if y - row_height < BOTTOM:
                pages.append([])
                y = PAGE_HEIGHT - TOP
            pages[-1].append((part, row_size, style))
            y -= row_height

    return pages


def build_pdf(pages: list[list[tuple[str, int, str]]]) -> bytes:
    objects: list[bytes] = []

    def add(obj: bytes) -> int:
        objects.append(obj)
        return len(objects)

    font_regular = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font_mono = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    page_refs: list[int] = []
    content_refs: list[int] = []

    for page in pages:
        commands = ["BT"]
        y = PAGE_HEIGHT - TOP
        for text, size, style in page:
            font = "F1"
            if style == "bold":
                font = "F2"
            elif style == "mono":
                font = "F3"
            commands.append(f"/{font} {size} Tf")
            commands.append(f"1 0 0 1 {LEFT} {y} Tm")
            commands.append(f"({pdf_escape(text)}) Tj")
            y -= max(LINE_HEIGHT, size + 4)
        commands.append("ET")
        stream = "\n".join(commands).encode("latin-1", "replace")
        content_refs.append(
            add(
                b"<< /Length "
                + str(len(stream)).encode()
                + b" >>\nstream\n"
                + stream
                + b"\nendstream"
            )
        )
        page_refs.append(0)

    pages_ref_placeholder = len(objects) + len(pages) + 1
    for index, content_ref in enumerate(content_refs):
        page_refs[index] = add(
            (
                f"<< /Type /Page /Parent {pages_ref_placeholder} 0 R "
                f"/MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
                f"/Resources << /Font << /F1 {font_regular} 0 R /F2 {font_bold} 0 R /F3 {font_mono} 0 R >> >> "
                f"/Contents {content_ref} 0 R >>"
            ).encode()
        )

    kids = " ".join(f"{ref} 0 R" for ref in page_refs)
    pages_ref = add(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_refs)} >>".encode())
    catalog_ref = add(f"<< /Type /Catalog /Pages {pages_ref} 0 R >>".encode())

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{number} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_ref} 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF\n"
        ).encode()
    )
    return bytes(pdf)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python render_markdown_pdf.py input.md output.pdf", file=sys.stderr)
        return 2

    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    markdown = source.read_text(encoding="utf-8")
    pages = paginate(markdown_to_lines(markdown))
    target.write_bytes(build_pdf(pages))
    print(f"Wrote {target} ({len(pages)} pages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
