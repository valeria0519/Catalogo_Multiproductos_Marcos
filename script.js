const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQaN4SzgBoastQeqeDW84pYlTXrflYS0E56K21nOoV7TcypyafwF5QXvq6xLZsqrVq_zgA8YOUF8ICO/pub?gid=0&single=true&output=csv";
const WA_NUM    = "5491144751539";

const CAT_MAP = {
  "celular":           { emoji:"📱", label:"Celulares" },
  "celulares":         { emoji:"📱", label:"Celulares" },
  "telefonos":         { emoji:"📱", label:"Celulares" },
  "teléfonos":         { emoji:"📱", label:"Celulares" },
  "tv":                { emoji:"📺", label:"TV" },
  "televisor":         { emoji:"📺", label:"TV" },
  "televisores":       { emoji:"📺", label:"TV" },
  "hogar":             { emoji:"🏠", label:"Hogar" },
  "electrodomestico":  { emoji:"🔌", label:"Electro" },
  "electrodoméstico":  { emoji:"🔌", label:"Electro" },
  "electrodomesticos": { emoji:"🔌", label:"Electro" },
  "electrodomésticos": { emoji:"🔌", label:"Electro" },
  "sommier":           { emoji:"🛏️", label:"Sommier" },
  "colchon":           { emoji:"🛏️", label:"Sommier" },
  "colchón":           { emoji:"🛏️", label:"Sommier" },
  "perfume":           { emoji:"🌸", label:"Perfumería" },
  "perfumes":          { emoji:"🌸", label:"Perfumería" },
  "perfumeria":        { emoji:"🌸", label:"Perfumería" },
  "perfumería":        { emoji:"🌸", label:"Perfumería" },
  "silla":             { emoji:"🪑", label:"Sillas" },
  "sillas":            { emoji:"🪑", label:"Sillas" },
  "sillas gamer":      { emoji:"🎮", label:"Gamer" },
  "gamer":             { emoji:"🎮", label:"Gamer" },
  "bicicleta":         { emoji:"🚲", label:"Bicicletas" },
  "heladera":          { emoji:"🧊", label:"Heladeras" },
  "aire":              { emoji:"❄️",  label:"Aires" },
  "herramienta":       { emoji:"🔧", label:"Herramientas" },
  "herramientas":      { emoji:"🔧", label:"Herramientas" },
};
function catCfg(raw) {
  const k = (raw||"").toLowerCase().trim();
  return CAT_MAP[k] || { emoji:"🛍️", label: raw || "Otros" };
}

const WA_PATH = `<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>`;
const WA_SVG = `<svg viewBox="0 0 24 24" fill="currentColor">${WA_PATH}</svg>`;

function fmt(val) {
  if (!val && val !== 0) return null;
  const n = String(val).replace(/[^\d]/g, "");
  if (!n) return String(val);
  return "$" + parseInt(n).toLocaleString("es-AR");
}

function waMsg(p) {
  const precio = p.precio_cuota
    ? `${fmt(p.precio_cuota)} en ${p.cuotas || "?"} cuotas`
    : p.precio_contado ? fmt(p.precio_contado) : "precio a consultar";
  return encodeURIComponent(`Hola, quiero consultar por el producto ${p.producto} de ${precio}.`);
}
function waUrl(p) { return `https://wa.me/${WA_NUM}?text=${waMsg(p)}`; }

function parseCSV(txt) {
  const lines = txt.trim().split("\n");
  if (lines.length < 2) return [];

  function splitLine(line) {
    const vals = []; let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { vals.push(cur); cur = ""; }
      else cur += c;
    }
    vals.push(cur);
    return vals.map(v => v.trim().replace(/^"|"$/g, ""));
  }

  const hdrs = splitLine(lines[0]).map(h => h.toLowerCase().trim());
  const idx = {};
  const COLS = ["id","producto","categoria","descripcion","precio_contado","precio_cuotas","cuotas","imagen","stock","etiqueta","destacado","orden"];
  COLS.forEach(c => {
    const i = hdrs.indexOf(c);
    if (i !== -1) idx[c] = i;
    if (c === "precio_cuotas" && i === -1) { const j = hdrs.indexOf("precio_cuota"); if(j!==-1) idx[c]=j; }
    if (c === "producto" && i === -1) { const j = hdrs.indexOf("nombre"); if(j!==-1) idx[c]=j; }
  });

  const get = (vals, col) => (vals[idx[col]] ?? "").trim();

  return lines.slice(1).map((line, i) => {
    const v = splitLine(line);
    const producto = get(v, "producto");
    if (!producto) return null;
    return {
      id:             get(v,"id") || String(i+1),
      producto,
      categoria:      get(v,"categoria"),
      descripcion:    get(v,"descripcion"),
      precio_contado: get(v,"precio_contado"),
      precio_cuota:   get(v,"precio_cuotas"),
      cuotas:         get(v,"cuotas"),
      imagen:         get(v,"imagen"),
      stock:          get(v,"stock") || "disponible",
      etiqueta:       get(v,"etiqueta"),
      destacado:      get(v,"destacado"),
      orden:          parseInt(get(v,"orden")) || 999,
    };
  }).filter(Boolean).sort((a,b) => a.orden - b.orden);
}

function cardHTML(p) {
  const cfg      = catCfg(p.categoria);
  const dispon   = !["sin stock","agotado","no"].includes(p.stock.toLowerCase());
  const esDestad = ["sí","si","1","true"].includes((p.destacado||"").toLowerCase());
  const cuota    = fmt(p.precio_cuota);
  const contado  = fmt(p.precio_contado);

  const tags = [];
  if (esDestad) tags.push(`<span class="tag tag-dest">⭐ Destacado</span>`);
  if (p.etiqueta) tags.push(`<span class="tag tag-custom">${p.etiqueta}</span>`);
  if (!dispon)    tags.push(`<span class="tag tag-sin">Sin stock</span>`);

  const imgInner = p.imagen && p.imagen.startsWith("http")
    ? `<img src="${p.imagen}" alt="${p.producto}" loading="lazy" onerror="this.style.display='none'">`
    : cfg.emoji;

  let precioHTML;
  if (cuota) {
    precioHTML = `
      <p class="cuota-hint">Cuota desde</p>
      <p class="cuota-val">${cuota}</p>
      ${p.cuotas ? `<p class="cuota-num">en ${p.cuotas} cuotas</p>` : ""}
      ${contado ? `<p class="contado-val">Contado: ${contado}</p>` : ""}`;
  } else if (contado) {
    precioHTML = `<p class="cuota-hint">Precio contado</p><p class="cuota-val">${contado}</p>`;
  } else {
    precioHTML = `<p class="consultar-txt">Consultá precio</p>`;
  }

  return `
  <div class="card${dispon?"":" sin-stock"}" onclick="verDetalle('${p.id}')">
    <div class="card-img">
      ${imgInner}
      ${tags.length ? `<div class="card-tags">${tags.join("")}</div>` : ""}
    </div>
    <div class="card-body">
      <p class="card-cat">${cfg.emoji} ${cfg.label}</p>
      <p class="card-nombre">${p.producto}</p>
      ${p.descripcion ? `<p class="card-desc">${p.descripcion}</p>` : ""}
      <div class="card-price-block">${precioHTML}</div>
      <div class="card-foot">
        <span class="stock-dot ${dispon?"dot-ok":"dot-no"}"></span>
        <span class="stock-txt">${dispon?"Disponible":"Sin stock"}</span>
        <a class="card-wa-btn" href="${waUrl(p)}" target="_blank" onclick="event.stopPropagation()">
          ${WA_SVG} Consultar
        </a>
      </div>
    </div>
  </div>`;
}

let PRODS     = [];
let catActiva = "todos";
let paginaAnterior = "home";

function renderGrid(id, lista) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = lista.length ? lista.map(cardHTML).join("") : "";
}

function skeletons(id, n=6) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = Array(n).fill(`<div class="skel"></div>`).join("");
}

function getCats(prods) {
  const m = {};
  prods.forEach(p => {
    const k = (p.categoria||"otro").toLowerCase().trim();
    m[k] = (m[k]||0) + 1;
  });
  return Object.entries(m).sort((a,b)=>b[1]-a[1]);
}

function buildCatsHome(cats) {
  const el = document.getElementById("cats-home");
  if (!el) return;
  el.innerHTML = cats.map(([k,n]) => {
    const c = catCfg(k);
    return `<div class="cat-chip" onclick="irCatalogoFiltrado('${k}')">
      <div class="cat-emoji">${c.emoji}</div>
      <div class="cat-name">${c.label}</div>
    </div>`;
  }).join("");
}

function buildSidebarCats(cats) {
  const el = document.getElementById("sidebar-cats");
  if (!el) return;
  el.innerHTML = `
    <button class="fcat-btn active" data-cat="todos" onclick="setCategoria('todos',this)">
      🔥 Todos <span class="fcat-cnt">${PRODS.length}</span>
    </button>
    ${cats.map(([k,n]) => {
      const c = catCfg(k);
      return `<button class="fcat-btn" data-cat="${k}" onclick="setCategoria('${k}',this)">
        ${c.emoji} ${c.label} <span class="fcat-cnt">${n}</span>
      </button>`;
    }).join("")}`;
}

function setCategoria(cat, btn) {
  catActiva = cat;
  document.querySelectorAll(".fcat-btn").forEach(b=>b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const h = document.getElementById("cat-title");
  if (h) h.textContent = cat==="todos" ? "Todos los productos" : catCfg(cat).label;
  aplicarFiltros();
}

function aplicarFiltros() {
  const fDisp  = document.getElementById("f-disp")?.checked;
  const fSin   = document.getElementById("f-sin")?.checked;
  const fCuota = document.getElementById("f-cuota")?.checked;

  let lista = PRODS;
  if (catActiva !== "todos") lista = lista.filter(p=>(p.categoria||"").toLowerCase().trim()===catActiva);
  if (fDisp)  lista = lista.filter(p=>!["sin stock","agotado","no"].includes(p.stock.toLowerCase()));
  if (fSin)   lista = lista.filter(p=>["sin stock","agotado","no"].includes(p.stock.toLowerCase()));
  if (fCuota) lista = lista.filter(p=>!!p.precio_cuota);

  const grid  = document.getElementById("grid-catalogo");
  const empty = document.getElementById("empty-cat");
  const count = document.getElementById("cat-count");

  renderGrid("grid-catalogo", lista);
  if (empty) empty.style.display = lista.length ? "none" : "block";
  if (count) count.textContent = `${lista.length} producto${lista.length!==1?"s":""}`;
}

function limpiarFiltros() {
  catActiva = "todos";
  ["f-disp","f-sin","f-cuota"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.checked=false;
  });
  document.querySelectorAll(".fcat-btn").forEach(b=>b.classList.remove("active"));
  document.querySelector('.fcat-btn[data-cat="todos"]')?.classList.add("active");
  const h = document.getElementById("cat-title");
  if (h) h.textContent = "Todos los productos";
  aplicarFiltros();
}

function verDetalle(id) {
  const p = PRODS.find(x=>x.id===id);
  if (!p) return;
  const cfg     = catCfg(p.categoria);
  const dispon  = !["sin stock","agotado","no"].includes(p.stock.toLowerCase());
  const cuota   = fmt(p.precio_cuota);
  const contado = fmt(p.precio_contado);

  const imgInner = p.imagen && p.imagen.startsWith("http")
    ? `<img src="${p.imagen}" alt="${p.producto}">`
    : `<span style="font-size:90px">${cfg.emoji}</span>`;

  let precioHTML;
  if (cuota) {
    precioHTML = `
      <p class="det-cuota-hint">Cuota desde</p>
      <p class="det-cuota">${cuota}</p>
      ${p.cuotas ? `<p class="det-cuota-num">en ${p.cuotas} cuotas</p>` : ""}
      ${contado ? `<p class="det-contado">Precio contado: ${contado}</p>` : ""}`;
  } else if (contado) {
    precioHTML = `<p class="det-cuota-hint">Precio</p><p class="det-cuota">${contado}</p>`;
  } else {
    precioHTML = `<p class="det-cuota" style="font-size:28px">Consultá precio</p>`;
  }

  document.getElementById("det-body").innerHTML = `
    <div class="det-grid">
      <div class="det-img">${imgInner}</div>
      <div>
        <p class="det-cat">${cfg.emoji} ${cfg.label}</p>
        <h1 class="det-nombre">${p.producto}</h1>
        ${p.descripcion ? `<p class="det-desc">${p.descripcion}</p>` : ""}
        <div class="det-price-block">${precioHTML}</div>
        <div class="det-stock ${dispon?"ok":"no"}">
          ${dispon ? "✅ Disponible" : "⛔ Sin stock"}
        </div>
        <a href="${waUrl(p)}" class="det-wa-btn" target="_blank">
          ${WA_SVG} Consultar por WhatsApp
        </a>
        <p style="font-size:11px;color:#666;margin-top:12px;text-align:center">
          Mensaje automático:<br>
          <em style="color:#888">"Hola, quiero consultar por el producto ${p.producto}${cuota?" de "+fmt(p.precio_cuota)+" en "+(p.cuotas||"?")+" cuotas":""}."</em>
        </p>
      </div>
    </div>`;

  irPagina("detalle");
}

let searchDelay;
document.getElementById("search-input").addEventListener("input", function() {
  const q = this.value.trim();
  document.getElementById("search-clear").classList.toggle("show", q.length > 0);
  clearTimeout(searchDelay);
  if (!q) { navHome(); return; }
  searchDelay = setTimeout(() => buscar(q), 260);
});

function buscar(q) {
  const lo = q.toLowerCase();
  const res = PRODS.filter(p =>
    p.producto.toLowerCase().includes(lo) ||
    (p.categoria||"").toLowerCase().includes(lo) ||
    (p.descripcion||"").toLowerCase().includes(lo) ||
    (p.etiqueta||"").toLowerCase().includes(lo)
  );
  const title = document.getElementById("search-title");
  if (title) title.textContent = `Resultados para "${q}"`;
  renderGrid("grid-search", res);
  const empty = document.getElementById("empty-search");
  const grid  = document.getElementById("grid-search");
  if (empty) empty.style.display = res.length ? "none" : "block";
  if (grid)  grid.style.display  = res.length ? "" : "none";
  irPagina("search");
}

function limpiarBusqueda() {
  document.getElementById("search-input").value = "";
  document.getElementById("search-clear").classList.remove("show");
  navHome();
}

function irPagina(nombre) {
  document.querySelectorAll(".pg").forEach(p=>p.classList.remove("active"));
  document.getElementById(`pg-${nombre}`)?.classList.add("active");
  window.scrollTo(0,0);
  document.getElementById("bn-home")?.classList.toggle("active", nombre==="home");
  document.getElementById("bn-cat")?.classList.toggle("active",  nombre==="catalogo");
}

function navHome() {
  paginaAnterior = "home";
  irPagina("home");
}

function navCatalogo() {
  paginaAnterior = "catalogo";
  limpiarFiltros();
  irPagina("catalogo");
}

function irCatalogoFiltrado(cat) {
  paginaAnterior = "catalogo";
  irPagina("catalogo");
  const btn = document.querySelector(`.fcat-btn[data-cat="${cat}"]`);
  setCategoria(cat, btn);
}

function navAtras() { irPagina(paginaAnterior); }

function abrirSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("sidebar-overlay")?.classList.add("show");
}
function cerrarSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebar-overlay")?.classList.remove("show");
}

async function cargar() {
  skeletons("grid-destacados", 4);
  skeletons("grid-todos", 6);
  try {
    const res  = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    PRODS = parseCSV(text);
    if (!PRODS.length) throw new Error("Sheet vacía");
    renderTodo();
  } catch(e) {
    // Mostrar error en pantalla en lugar de demo
    ["grid-destacados","grid-todos","grid-catalogo"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p style="color:#e53935;padding:20px;text-align:center">
        ⚠️ No se pudieron cargar los productos.<br>
        <small>${e.message}</small>
      </p>`;
    });
    console.error("Error cargando Sheet:", e);
  }
}

function renderTodo() {
  const cats = getCats(PRODS);
  const dest = PRODS.filter(p=>["sí","si","1","true"].includes((p.destacado||"").toLowerCase()));

  renderGrid("grid-destacados", dest.length ? dest : PRODS.slice(0,6));
  buildCatsHome(cats);
  buildSidebarCats(cats);
  aplicarFiltros();
}

cargar();