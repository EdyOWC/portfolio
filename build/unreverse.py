#!/usr/bin/env python3
"""Hebrew PDFs extracted by the Drive connector come out with the whole line
reversed. Reversing the line restores the Hebrew, but then digits and Latin
runs are backwards, so those get reversed a second time."""
import re
import sys

LATIN_OR_NUM = re.compile(r'[A-Za-z0-9][A-Za-z0-9.,:/\-\'"%]*')


def fix_line(line: str) -> str:
    out = line[::-1]
    return LATIN_OR_NUM.sub(lambda m: m.group(0)[::-1], out)


def main() -> None:
    src = sys.argv[1]
    with open(src, encoding='utf-8') as fh:
        text = fh.read()
    fixed = '\n'.join(fix_line(l.rstrip()) for l in text.split('\n'))
    sys.stdout.write(fixed)


if __name__ == '__main__':
    main()
