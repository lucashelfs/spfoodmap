const DEFAULT_FILL = "#ccc";
const HAS_DATA_FILL = "#5cb87a";
const HOVER_FILL = "#3f9c62";
const STROKE = "#888";

const panel = document.getElementById("panel");
const mapEl = document.getElementById("map");

function restaurantCard(r) {
  const div = document.createElement("div");
  div.className = "restaurant-card";
  div.innerHTML = `
    <h3>${r.name}</h3>
    <p class="meta">${r.cuisine} — ${r.neighborhood}</p>
    <p class="meta">${r.address}</p>
    ${r.notes ? `<p class="notes">${r.notes}</p>` : ""}
  `;
  return div;
}

function renderPanel(countryName, restaurants) {
  panel.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = countryName;
  panel.appendChild(h2);

  if (!restaurants.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No restaurants curated for this country yet.";
    panel.appendChild(p);
    return;
  }
  restaurants.forEach((r) => panel.appendChild(restaurantCard(r)));
}

async function main() {
  const [countries, restaurants] = await Promise.all([
    d3.json("../data/countries-110m.geojson"),
    d3.json("../data/restaurants.json"),
  ]);

  const byCountry = restaurants.reduce((acc, r) => {
    (acc[r.countryCode] ??= []).push(r);
    return acc;
  }, {});

  const width = mapEl.clientWidth;
  const height = mapEl.clientHeight;

  const projection = d3.geoNaturalEarth1().fitSize([width, height], countries);
  const path = d3.geoPath(projection);

  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g").attr("stroke-width", 0.5);

  svg.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        g.attr("stroke-width", 0.5 / event.transform.k);
      })
  );

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
    .on("click", (event, d) => {
      renderPanel(d.properties.name, byCountry[d.properties.iso_a2] || []);
    });
}

main().catch((err) => {
  panel.innerHTML = `<p class="empty">Failed to load map data: ${err.message}</p>`;
  console.error(err);
});
