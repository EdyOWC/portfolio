#!/usr/bin/env python3
"""Decode the base64 payloads the Drive connector saves to disk into real
image files, without pulling megabytes of base64 through the context window."""
import base64, glob, json, os, sys

RESULTS = '/root/.claude/projects/-home-claude/c6b372a1-d48d-5090-9fab-0be8b9cfbc35/tool-results'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/oys/static/assets/img/_incoming'
os.makedirs(OUT, exist_ok=True)

EXT = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif'}

for path in sorted(glob.glob(os.path.join(RESULTS, 'mcp-Google_Drive-download_file_content-*.txt'))):
    try:
        with open(path, encoding='utf-8') as fh:
            d = json.load(fh)
    except Exception:
        continue
    mime = d.get('mimeType', '')
    if mime not in EXT:
        continue
    name = os.path.splitext(d.get('title') or d['id'])[0] + EXT[mime]
    dest = os.path.join(OUT, name)
    if os.path.exists(dest):
        continue
    with open(dest, 'wb') as fh:
        fh.write(base64.b64decode(d['content']))
    print('wrote', name, os.path.getsize(dest), 'bytes')
