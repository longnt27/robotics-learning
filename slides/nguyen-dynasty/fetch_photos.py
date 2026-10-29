#!/usr/bin/env python3
"""Download independently licensed Nguyễn-dynasty imagery in GitHub Actions.

Never silently use a different picture for a historical person or artifact.
Attribution is written next to the downloaded files and embedded in PPTX notes.
"""
from __future__ import annotations
import hashlib, html, json, os, pathlib, re, sys, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
UA = "NguyenDynastySlides/1.0 (https://github.com/longnt27/robotics-learning; educational presentation)"
API = "https://commons.wikimedia.org/w/api.php"
REPO_RAW = "https://raw.githubusercontent.com/schoolcodecsharp/DoAn4/main/backend/wwwroot/media/vietnam/"

# Titles selected from Commons file pages; do not auto-pick a search result.
FILES = [
    {"id": "gia_long", "file": "Emperor Gia Long.jpg", "subject": "Vua Gia Long", "license": "Public domain"},
    {"id": "bao_dai", "file": "Portrait of Emperor Bảo Đại.png", "subject": "Vua Bảo Đại (chân dung năm 1934)", "license": "Public domain"},
    {"id": "ngo_mon", "file": "Ngo Mon Gate for entry to the Imperial Citadel, Hue (31654316702).jpg", "subject": "Ngọ Môn, Huế", "license": "See Wikimedia page", "fallback": "hue-imperial-gate.jpg"},
    {"id": "khai_dinh", "file": "The tomb of Emperor Khai Dinh (12060688173).jpg", "subject": "Lăng Khải Định", "license": "See Wikimedia page"},
    {"id": "woodblocks", "file": "Woodblocks of the Nguyễn Dynasty 01.jpg", "subject": "Mộc bản triều Nguyễn", "license": "See Wikimedia page"},
    {"id": "hue_citadel", "fallback": "dai-noi-hue.jpg", "subject": "Đại Nội Huế", "license": "See source metadata"},
    {"id": "tourane_1858", "file": "Dien Hai Citadel bombing by French fleet.jpg",
     "subject": "Tranh khắc trận Đà Nẵng 1858 (Louis Le Breton)",
     "license": "Public domain"},
]

def fetch(url: str, tries: int = 4) -> bytes:
    last = None
    for n in range(tries):
        try:
            request = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Accept": "application/json,image/avif,image/webp,image/png,image/jpeg,*/*",
            })
            with urllib.request.urlopen(request, timeout=35) as response:
                data = response.read(18_000_000)
                if not data: raise ValueError("empty image")
                return data
        except Exception as ex:
            last = ex
            time.sleep(min(2 * (n + 1), 7))
    raise RuntimeError(f"download failed: {url}: {last}")

def commons_file_url(name: str) -> str:
    fname = name.replace(" ", "_")
    digest = hashlib.md5(fname.encode("utf-8")).hexdigest()
    quoted = urllib.parse.quote(fname, safe="()'-,")
    return f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{quoted}"

def query_commons(filename: str) -> dict:
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": 1280, "titles": "File:" + filename,
    })
    obj = json.loads(fetch(API + "?" + params))
    pages = list(obj.get("query", {}).get("pages", {}).values())
    if not pages or "imageinfo" not in pages[0]:
        raise ValueError("file missing from Commons")
    return pages[0]["imageinfo"][0]

def is_image(data: bytes) -> bool:
    return data.startswith(b"\xff\xd8\xff") or data.startswith(b"\x89PNG\r\n\x1a\n")

def strip_html(s: str) -> str:
    return re.sub(r"<[^>]*>", "", html.unescape(s or "")).strip()[:700]

results = {}
for item in FILES:
    key = item["id"]
    ext = ".png" if item.get("file", "").lower().endswith(".png") else ".jpg"
    path = ASSETS / (key + ext)
    record = {
        "id": key, "subject": item["subject"], "license": item["license"],
        "source": "", "author": "See source page", "sha256": "",
        "path": path.name, "origin": ""
    }
    data = None
    if item.get("file"):
        name = item["file"]
        record["source"] = "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(name.replace(" ", "_"))
        try:
            info = query_commons(name)
            metadata = info.get("extmetadata") or {}
            record["author"] = strip_html(metadata.get("Artist", {}).get("value", "")) or record["author"]
            record["license"] = strip_html(metadata.get("LicenseShortName", {}).get("value", "")) or record["license"]
            target = info.get("thumburl") or info["url"]
            data = fetch(target)
            record["origin"] = "Wikimedia Commons"
        except Exception as ex:
            print(f"WARN {key}: Commons API failed: {ex}", file=sys.stderr)
            try:
                data = fetch(commons_file_url(name))
                record["origin"] = "Wikimedia direct"
            except Exception as ex2:
                print(f"WARN {key}: direct Commons failed: {ex2}", file=sys.stderr)
    if data is None and item.get("fallback"):
        filename = item["fallback"]
        try:
            data = fetch(REPO_RAW + filename)
            record["origin"] = "GitHub mirror of Wikimedia Commons"
            meta = json.loads(fetch(REPO_RAW + filename + ".source.json"))
            record["source"] = meta.get("Nguon", record["source"])
            record["author"] = strip_html(meta.get("TacGia", "")) or record["author"]
            record["license"] = meta.get("GiayPhep", record["license"])
        except Exception as ex:
            print(f"WARN {key}: GitHub mirror failed: {ex}", file=sys.stderr)
    if data is None or not is_image(data):
        print(f"WARN {key}: no validated image found; will omit, never substitute", file=sys.stderr)
        continue
    # The file might be a PNG with a non-PNG extension and vice versa.
    actual_ext = ".png" if data.startswith(b"\x89PNG") else ".jpg"
    path = ASSETS / (key + actual_ext)
    record["path"] = path.name
    record["sha256"] = hashlib.sha256(data).hexdigest()
    path.write_bytes(data)
    results[key] = record
    print(f"PHOTO {key}: {len(data)} bytes from {record['origin']}")
manifest = {"assets": results, "source_policy": "Real photographs or documented period images; see per-image credits."}
(ASSETS / "credits.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
lines = ["id,subject,source,author,license,sha256"]
import csv
with (ASSETS / "credits.csv").open("w", newline="", encoding="utf-8") as handle:
    writer = csv.writer(handle)
    writer.writerow(lines[0].split(","))
    for v in results.values():
        writer.writerow([v[k] for k in ("id", "subject", "source", "author", "license", "sha256")])
# Mandatory: at least one verified Hue photo + an actual Nguyễn emperor portrait.
required = {"gia_long", "bao_dai", "ngo_mon", "khai_dinh",
            "woodblocks", "hue_citadel", "tourane_1858"}
missing = sorted(required.difference(results))
if missing:
    raise SystemExit(f"Missing historically verified images: {missing}")
print("Ready:", len(results), "authentic images")
