#!/usr/bin/env python3
"""Recolecta imágenes libres de Wikimedia Commons para los perfiles de Brújula.

Uso (desde la raíz del repo):  python3 scripts/fetch_images.py [--dry-run]
Requiere acceso de red a es/en.wikipedia.org, commons.wikimedia.org y upload.wikimedia.org.
Escribe public/img/profiles/{ar|intl}/{id}.{ext}, src/data/images.json y review.tsv (para revisión manual).
"""
import glob, html, io, json, os, re, sys, time
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Carpeta opcional con perfiles aún no integrados (mismo formato que profiles.json).
R2 = os.environ.get("BRUJULA_PENDING", "")
IMG_DIR = os.path.join(ROOT, "public", "img", "profiles")
MANIFEST = os.path.join(ROOT, "src", "data", "images.json")
UA = {"User-Agent": "BrujulaBot/1.0 (https://github.com/auparrino/compass; test político educativo)"}
MAX_BYTES = 60 * 1024
PAUSE = 4.0
S = requests.Session(); S.headers.update(UA)

FIGURES = {"ar_historicas", "ar_actuales", "intl_historicas", "intl_actuales"}

# Títulos de Wikipedia en español (con desambiguación) cuando el nombre no alcanza.
ES_TITLES = {
    # figuras AR
    "sarmiento": "Domingo Faustino Sarmiento", "roca": "Julio Argentino Roca",
    "peron": "Juan Domingo Perón", "evita": "Eva Perón", "alem": "Leandro N. Alem",
    "marcelo_t_de_alvear": "Marcelo Torcuato de Alvear", "agustin_p_justo": "Agustín Pedro Justo",
    "roberto_m_ortiz": "Roberto Marcelino Ortiz", "hector_j_campora": "Héctor José Cámpora",
    "rogelio_frigerio_padre": "Rogelio Julio Frigerio", "juan_b_justo": "Juan Bautista Justo",
    "isabel_peron": "María Estela Martínez de Perón", "ignacio_torres": "Ignacio Torres (político)",
    "gerardo_morales": "Gerardo Morales (político argentino)", "luis_caputo": "Luis Caputo",
    "caputo": "Luis Caputo", "cfk": "Cristina Fernández de Kirchner", "cfk_intl": "Cristina Fernández de Kirchner",
    "milei_intl": "Javier Milei", "macri_intl": "Mauricio Macri",
    # figuras intl
    "che": "Ernesto Guevara", "lula": "Luiz Inácio Lula da Silva", "vance": "JD Vance",
    "fdr": "Franklin D. Roosevelt", "deng": "Deng Xiaoping", "degaulle": "Charles de Gaulle",
    "zelenski": "Volodímir Zelenski", "von_der_leyen": "Ursula von der Leyen",
    "delarua": "Fernando de la Rúa", "nestor": "Néstor Kirchner",
    # partidos / espacios (logo)
    "ucr": "Unión Cívica Radical", "ucr_p": "Unión Cívica Radical",
    "socialismo_ps": "Partido Socialista (Argentina)",
    "fitu": "Frente de Izquierda y de Trabajadores - Unidad", "fit_p": "Frente de Izquierda y de Trabajadores - Unidad",
    "lla": "La Libertad Avanza", "lla_p": "La Libertad Avanza",
    "pro": "Propuesta Republicana", "pro_p": "Propuesta Republicana",
    "coalicion_civica": "Coalición Cívica ARI", "frente_renovador": "Frente Renovador",
    "provincias_unidas": "Provincias Unidas (alianza)", "patria_grande": "Frente Patria Grande",
    "ucede": "Unión del Centro Democrático", "frepaso": "Frente País Solidario",
    "cgt": "Confederación General del Trabajo de la República Argentina",
    "economia_popular": "Movimiento Evita", "uxp_p": "Unión por la Patria",
    "dem_p": "Partido Demócrata (Estados Unidos)", "gop_p": "Partido Republicano (Estados Unidos)",
    "psoe_p": "Partido Socialista Obrero Español", "pp_p": "Partido Popular (España)",
    "vox_p": "Vox (partido político)", "pt_p": "Partido de los Trabajadores (Brasil)",
    "pl_p": "Partido Liberal (Brasil)", "morena_p": "Morena (partido político)",
    "rn_p": "Agrupación Nacional", "renaissance_p": "Renacimiento (partido político de Francia)",
    "labour_p": "Partido Laborista (Reino Unido)", "cdu_p": "Unión Demócrata Cristiana de Alemania",
    "grunen_p": "Alianza 90/Los Verdes", "fa_cl_p": "Frente Amplio (Chile)",
    "afd": "Alternativa para Alemania", "spd": "Partido Socialdemócrata de Alemania",
    "die_linke": "Die Linke", "bsw": "Alianza Sahra Wagenknecht", "reform_uk": "Reform UK",
    "conservadores_uk": "Partido Conservador (Reino Unido)", "lfi": "La Francia Insumisa",
    "les_republicains": "Los Republicanos (Francia)", "sumar": "Sumar (partido político)",
    "fidesz": "Fidesz", "pis": "Ley y Justicia", "ko_polonia": "Plataforma Cívica",
    "fratelli_ditalia": "Hermanos de Italia", "m5s": "Movimiento 5 Estrellas",
    "pvv": "Partido por la Libertad", "likud": "Likud", "bjp": "Bharatiya Janata Party",
    "inc": "Congreso Nacional Indio", "liberal_canada": "Partido Liberal de Canadá",
    "frente_amplio_uy": "Frente Amplio (Uruguay)", "anc": "Congreso Nacional Africano",
    "partido_colorado_py": "Partido Colorado (Paraguay)",
}
# Fallback en inglés para partidos (muchos logos de es/en no están en Commons: se descartan solos).
EN_TITLES = {
    "dem_p": "Democratic Party (United States)", "gop_p": "Republican Party (United States)",
    "labour_p": "Labour Party (UK)", "conservadores_uk": "Conservative Party (UK)",
    "pl_p": "Liberal Party (Brazil, 2006)", "rn_p": "National Rally", "renaissance_p": "Renaissance (French political party)",
    "cdu_p": "Christian Democratic Union of Germany", "grunen_p": "Alliance 90/The Greens",
    "fa_cl_p": "Broad Front (Chile)", "frente_amplio_uy": "Broad Front (Uruguay)",
    "sumar": "Sumar (electoral platform)", "pis": "Law and Justice", "ko_polonia": "Civic Coalition (Poland)",
    "pvv": "Party for Freedom", "bjp": "Bharatiya Janata Party", "inc": "Indian National Congress",
    "anc": "African National Congress", "partido_colorado_py": "Colorado Party (Paraguay)",
    "liberal_canada": "Liberal Party of Canada", "ucede": "Union of the Democratic Centre (Argentina)",
}
# Tradiciones AR que son organización concreta -> logo.
AR_ORGS = {"ucr", "socialismo_ps", "fitu", "lla", "pro", "coalicion_civica", "frente_renovador",
           "provincias_unidas", "patria_grande", "ucede", "frepaso", "cgt", "economia_popular"}
# Símbolos: archivos candidatos de Commons (se verifican) y/o búsqueda en Commons (revisar a mano).
SYMBOLS = {
    "peronismo_ortodoxo": {"files": ["Escudo del Partido Justicialista.svg"], "search": "escudo Partido Justicialista"},
    "desarrollismo": {"search": "Movimiento de Integración y Desarrollo logo"},
    "socialdemocracia": {"files": ["Red rose.svg", "Socialist rose.svg"], "search": "socialist red rose logo svg"},
    "socialismo_democratico": {"files": ["Red rose.svg", "Socialist rose.svg"], "search": "red rose socialism svg"},
    "marxismo_leninismo": {"files": ["Hammer and sickle.svg", "Hammer and sickle red on transparent.svg"]},
    "anarcocomunismo": {"files": ["Anarchist flag.svg", "Anarchist-communist flag.svg"], "search": "anarcho-communism flag svg"},
    "anarcocapitalismo": {"files": ["Anarcho-capitalism flag.svg", "Anarcho-capitalist flag.svg"], "search": "anarcho-capitalism flag svg"},
    "libertarismo": {"files": ["Gadsden flag.svg"]},
    "ecologismo_verde": {"search": "green politics sunflower symbol svg"},
    "ecosocialismo": {"search": "eco-socialism flag svg"},
    "municipalismo_libertario": {"search": "libertarian municipalism flag svg"},
    "georgismo": {"search": "georgism flag svg"},
    "distributismo": {"search": "distributism flag svg"},
}
FREE_RE = re.compile(r"^(cc0|cc[- ]by|public domain|pd|gfdl|attribution|no restrictions|copyrighted free use|free art)", re.I)


def fetch(url, params=None, tries=8):
    """GET con reintentos; ante 429 respeta Retry-After (Wikimedia limita el ritmo)."""
    for i in range(tries):
        try:
            r = S.get(url, params=params, timeout=60)
            if r.status_code == 429:
                wait = int(r.headers.get("Retry-After", 0) or 0) or 15 * (i + 1)
                print(f"429, espero {wait}s", flush=True); time.sleep(wait); continue
            r.raise_for_status(); time.sleep(PAUSE); return r
        except requests.RequestException:
            if i == tries - 1: raise
            time.sleep(3 * (i + 1))
    raise RuntimeError(f"demasiados 429: {url}")


def get(url, params):
    return fetch(url, {**params, "format": "json", "formatversion": 2}).json()


def load_profiles():
    out = []
    for t in ("ar", "intl"):
        for p in json.load(open(f"{ROOT}/src/data/{t}/profiles.json"))["profiles"]:
            out.append((t, p))
    seen = {(t, p["id"]) for t, p in out}
    for f in sorted(glob.glob(os.path.join(R2, "*.json"))) if R2 else []:
        try: data = json.load(open(f))
        except Exception: continue
        if isinstance(data, dict): data = data.get("profiles", [])
        if not isinstance(data, list): continue
        for p in data:
            if isinstance(p, dict) and "id" in p and str(p.get("catalog", "")).startswith(("ar_", "intl_")):
                t = p["catalog"].split("_")[0]
                if (t, p["id"]) not in seen: out.append((t, p)); seen.add((t, p["id"]))
    return out


def kind_of(t, p):
    c = p.get("catalog", "")
    if c in FIGURES: return "photo"
    if c == "intl_partidos" or (c == "ar_tradiciones" and p["id"] in AR_ORGS): return "logo"
    return "symbol"


def page_images(lang, titles):
    """{requested_title: (file, disambig)} via pageimages, 50 por pedido."""
    res = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        d = get(f"https://{lang}.wikipedia.org/w/api.php", {"action": "query", "prop": "pageimages|pageprops",
                "piprop": "name", "redirects": 1, "titles": "|".join(chunk)})
        q = d.get("query", {}); m = {}
        for x in q.get("normalized", []) + q.get("redirects", []): m[x["to"]] = x["from"]
        for pg in q.get("pages", []):
            orig = pg["title"]
            while orig in m and orig not in chunk: orig = m[orig]
            res[orig] = (pg.get("pageimage"), "disambiguation" in pg.get("pageprops", {}), pg.get("missing", False))
    return res


_INFO = {}


def commons_infos(fnames, width=250):
    """Pide la info de hasta 50 archivos por consulta (la API de Commons limita el ritmo)."""
    todo = [f for f in dict.fromkeys(fnames) if (f, width) not in _INFO]
    for i in range(0, len(todo), 50):
        chunk = todo[i:i + 50]
        d = get("https://commons.wikimedia.org/w/api.php", {"action": "query", "titles": "|".join("File:" + f for f in chunk),
                "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": width})
        q = d["query"]; alias = {}
        for x in q.get("normalized", []) + q.get("redirects", []): alias[x["to"]] = x["from"]
        for pg in q.get("pages", []):
            t = pg["title"]
            while t in alias: t = alias[t]
            _INFO[(t.split(":", 1)[1], width)] = _parse_info(pg)
        for f in chunk: _INFO.setdefault((f, width), None)


def commons_info(fname, width=250):
    commons_infos([fname], width)
    return _INFO.get((fname, width))


def _parse_info(pg):
    if pg.get("missing") or "imageinfo" not in pg: return None  # no está en Commons
    ii = pg["imageinfo"][0]; md = ii.get("extmetadata", {})
    val = lambda k: (md.get(k) or {}).get("value", "")
    lic = val("LicenseShortName").strip()
    if val("NonFree").lower() == "true" or not FREE_RE.match(lic): return None
    author = html.unescape(re.sub(r"<[^>]+>", "", val("Artist"))).strip() or "Desconocido"
    author = re.sub(r"\s+", " ", author)
    return {"thumb": ii.get("thumburl") or ii["url"], "license": lic, "licenseUrl": val("LicenseUrl"),
            "sourceUrl": ii.get("descriptionurl"), "author": author[:200], "file": pg["title"]}


def commons_search(q):
    d = get("https://commons.wikimedia.org/w/api.php", {"action": "query", "list": "search",
            "srnamespace": 6, "srsearch": q, "srlimit": 5})
    return [h["title"].split(":", 1)[1] for h in d["query"]["search"]]


def download(info, fname):
    # Anchos estándar de Wikimedia: los demás se generan a pedido y se limitan con 429.
    for w in (250, 120):
        if w != 250: info = commons_info(fname, w) or info
        r = fetch(info["thumb"])
        if len(r.content) <= MAX_BYTES: return r.content, info
    return None, info


def main(dry=False):
    profiles = [(t, p) for t, p in load_profiles() if not p.get("sensitive")]
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {"version": "images-1.0.0", "images": {"ar": {}, "intl": {}}}
    # Resolver artículos (es, luego en) para fotos y logos.
    cand = {}
    for lang, table in (("es", ES_TITLES), ("en", EN_TITLES)):
        todo = [(t, p) for t, p in profiles if kind_of(t, p) != "symbol" and (t, p["id"]) not in cand]
        titles = {(t, p["id"]): table.get(p["id"], p["name"] if lang == "es" or kind_of(t, p) == "photo" else None) for t, p in todo}
        titles = {k: v for k, v in titles.items() if v}
        pi = page_images(lang, sorted(set(titles.values())))
        for k, title in titles.items():
            f, dis, miss = pi.get(title, (None, False, True))
            if f and not dis: cand[k] = (f, f"{lang}:{title}")
    # Toda la info de Commons de una vez, en lotes de 50.
    wanted = [f for (_, _), (f, _) in cand.items()]
    for spec in SYMBOLS.values(): wanted += spec.get("files", [])
    commons_infos(wanted)
    review = []
    for t, p in profiles:
        pid, kind = p["id"], kind_of(t, p)
        files, note = [], ""
        if pid in manifest["images"].get(t, {}):
            continue  # ya bajada: permite retomar tras un corte
        if kind == "symbol":
            spec = SYMBOLS.get(pid)
            if not spec: review.append((t, pid, kind, "", "", "sin símbolo claro")); continue
            files = list(spec.get("files", []))
            if not files: review.append((t, pid, kind, "", "", "símbolo sin archivo fijo")); continue
        elif (t, pid) in cand:
            files, note = [cand[(t, pid)][0]], cand[(t, pid)][1]
        info = None
        for f in files:
            info = commons_info(f)
            if info: break
        if not info:
            review.append((t, pid, kind, note, ",".join(files[:3]), "sin archivo libre en Commons")); continue
        if dry:
            review.append((t, pid, kind, note, info["file"], info["license"])); continue
        data, info = download(info, info["file"].split(":", 1)[1])
        if not data: review.append((t, pid, kind, note, info["file"], "demasiado pesado")); continue
        ext = os.path.splitext(info["thumb"].split("?")[0])[1].lower().replace(".jpeg", ".jpg")
        ext = ext if ext in (".jpg", ".png", ".webp") else ".png"
        os.makedirs(f"{IMG_DIR}/{t}", exist_ok=True)
        open(f"{IMG_DIR}/{t}/{pid}{ext}", "wb").write(data)
        manifest["images"].setdefault(t, {})[pid] = {"src": f"/img/profiles/{t}/{pid}{ext}", "kind": kind,
            "author": info["author"], "license": info["license"], "licenseUrl": info["licenseUrl"], "sourceUrl": info["sourceUrl"]}
        review.append((t, pid, kind, note, info["file"], info["license"]))
        print(t, pid, info["file"], info["license"], len(data), flush=True)
        if not dry: json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=2)
    with open(os.path.join(ROOT, "scripts", "review.tsv"), "w") as fh:
        for row in review: fh.write("\t".join(map(str, row)) + "\n")
    if not dry:
        json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=2)
        for t, imgs in manifest["images"].items():
            for pid, e in imgs.items():
                assert os.path.exists(ROOT + "/public" + e["src"]), e["src"]
    print("ok", {t: len(v) for t, v in manifest["images"].items()})


if __name__ == "__main__":
    main("--dry-run" in sys.argv)
