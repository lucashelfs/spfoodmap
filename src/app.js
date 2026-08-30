const DEFAULT_FILL = "#ccc";
const HAS_DATA_FILL = "#5cb87a";
const HOVER_FILL = "#3f9c62";
const STROKE = "#888";
const SELECTED_STROKE = "#1a1a1a";
const SELECTED_STROKE_WIDTH = 2;
const LANG_KEY = "spfoodmap-lang";
const SUPPORTED_LANGS = ["pt", "en", "es"];

const STRINGS = {
  en: {
    title: "São Paulo Food Map",
    subtitle: "Click a country to see restaurants in São Paulo serving that cuisine.",
    hint: "Click a highlighted country on the map.",
    empty: "No restaurants curated for this country yet.",
    loadError: "Failed to load map data",
  },
  pt: {
    title: "Mapa Gastronômico de São Paulo",
    subtitle: "Clique em um país para ver restaurantes em São Paulo com aquela culinária.",
    hint: "Clique em um país destacado no mapa.",
    empty: "Nenhum restaurante cadastrado para este país ainda.",
    loadError: "Falha ao carregar os dados do mapa",
  },
  es: {
    title: "Mapa Gastronómico de São Paulo",
    subtitle: "Haz clic en un país para ver restaurantes en São Paulo con esa cocina.",
    hint: "Haz clic en un país destacado en el mapa.",
    empty: "Todavía no hay restaurantes para este país.",
    loadError: "Error al cargar los datos del mapa",
  },
};

function detectLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (SUPPORTED_LANGS.includes(saved)) return saved;
  const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : "en";
}

let currentLang = detectLang();

function t(key) {
  return STRINGS[currentLang][key];
}

function countryName(feature) {
  const p = feature.properties;
  return (currentLang === "pt" && p.name_pt) || (currentLang === "es" && p.name_es) || p.name;
}

const panel = document.getElementById("panel");
const mapEl = document.getElementById("map");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");

let selectedFeature = null;
let byCountry = {};

function restaurantCard(r) {
  const div = document.createElement("div");
  div.className = "restaurant-card";
  const notes = r.notes && (r.notes[currentLang] || r.notes.en);
  div.innerHTML = `
    <h3>${r.name}</h3>
    <p class="meta">${r.cuisine} — ${r.neighborhood}</p>
    <p class="meta">${r.address}</p>
    ${notes ? `<p class="notes">${notes}</p>` : ""}
  `;
  return div;
}

function renderPanel() {
  panel.innerHTML = "";

  if (!selectedFeature) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = t("hint");
    panel.appendChild(p);
    return;
  }

  const restaurants = byCountry[selectedFeature.properties.iso_a2] || [];

  const h2 = document.createElement("h2");
  h2.textContent = countryName(selectedFeature);
  panel.appendChild(h2);

  if (!restaurants.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = t("empty");
    panel.appendChild(p);
    return;
  }
  restaurants.forEach((r) => panel.appendChild(restaurantCard(r)));
}

function applyStaticText() {
  document.documentElement.lang = currentLang;
  titleEl.textContent = t("title");
  subtitleEl.textContent = t("subtitle");
  document.querySelectorAll("#lang-switcher button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  applyStaticText();
  renderPanel();
}

document.querySelectorAll("#lang-switcher button").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

async function main() {
  const [countries, restaurants] = await Promise.all([
    d3.json("../data/countries-110m.geojson"),
    d3.json("../data/restaurants.json"),
  ]);

  byCountry = restaurants.reduce((acc, r) => {
    (acc[r.countryCode] ??= []).push(r);
    return acc;
  }, {});

  applyStaticText();
  renderPanel();

  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);

  const svg = d3.select("#map").append("svg");
  const g = svg.append("g").attr("stroke-width", 0.5);

  let selectedPath = null;
  let currentZoomK = 1;

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      currentZoomK = event.transform.k;
      g.attr("transform", event.transform);
      g.attr("stroke-width", 0.5 / currentZoomK);
      if (selectedPath) selectedPath.attr("stroke-width", SELECTED_STROKE_WIDTH / currentZoomK);
    });

  svg.call(zoom);

  function fit() {
    const width = mapEl.clientWidth;
    const height = mapEl.clientHeight;
    svg.attr("width", width).attr("height", height);
    projection.fitSize([width, height], countries);
    g.selectAll("path").attr("d", path);
  }

  fit();

  // Only grow/shrink the viewport on resize — keep the current pan/zoom in place,
  // don't re-fit the projection (that's what made the map jump/reset).
  window.addEventListener("resize", () => {
    svg.attr("width", mapEl.clientWidth).attr("height", mapEl.clientHeight);
  });

  g.selectAll("path")
    .data(countries.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => (byCountry[d.properties.iso_a2] ? HAS_DATA_FILL : DEFAULT_FILL))
    .attr("stroke", STROKE)
    .style("cursor", (d) => (byCountry[d.properties.iso_a2] ? "pointer" : "default"))
    .on("mouseover", function (event, d) {
      if (byCountry[d.properties.iso_a2]) d3.select(this).attr("fill", HOVER_FILL);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("fill", byCountry[d.properties.iso_a2] ? HAS_DATA_FILL : DEFAULT_FILL);
    })
    .on("click", function (event, d) {
      if (selectedPath) selectedPath.attr("stroke", STROKE).attr("stroke-width", null);
      selectedPath = d3.select(this).attr("stroke", SELECTED_STROKE).attr("stroke-width", SELECTED_STROKE_WIDTH / currentZoomK).raise();
      selectedFeature = d;
      renderPanel();
    });
}

main().catch((err) => {
  panel.innerHTML = `<p class="empty">${t("loadError")}: ${err.message}</p>`;
  console.error(err);
});
