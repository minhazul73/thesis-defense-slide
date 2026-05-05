import json, base64, os

BASE = r"d:\projects\thesis predefence\thesis-defense-slide"
ASSETS = os.path.join(BASE, "assets")

fname = r"Token_Stacking_Meta_Learner_with_Self_attentionStacked_Ensemble (2).ipynb"
path = os.path.join(BASE, fname)

with open(path, "r", encoding="utf-8") as f:
    nb = json.load(f)

img_index = 0
for cell_idx, cell in enumerate(nb.get("cells", [])):
    for output in cell.get("outputs", []):
        data = output.get("data", {})
        png = data.get("image/png") or data.get("image/jpeg")
        if not png:
            continue
        if isinstance(png, list):
            png = "".join(png)
        raw = base64.b64decode(png)
        src = "".join(cell.get("source", []))[:180].replace("\n", " ")
        out_name = f"ensemble_img{img_index}.png"
        out_path = os.path.join(ASSETS, out_name)
        with open(out_path, "wb") as of:
            of.write(raw)
        print(f"ensemble_img{img_index}  cell={cell_idx}  size={len(raw):>8}  src: {src[:120]}")
        img_index += 1

print(f"\nTotal: {img_index} images")
