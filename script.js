// PROOF it loads
console.log("script.js loaded");

// =====================
// 1) Multiply function
// =====================
function multiplyAll(...args) {
  if (args.length === 0) return 0;

  return args.reduce((product, value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError("multiplyAll only accepts valid numbers");
    }
    return product * value;
  }, 1);
}

(function showMultiplyResult() {
  const el = document.getElementById("multiplyResult");
  try {
    el.textContent = `multiplyAll(2, 3, 4, 5) = ${multiplyAll(2, 3, 4, 5)}`;
  } catch (e) {
    el.textContent = e.message;
  }
})();

// =====================
// 2) Remote API call
// =====================
async function fetchUsers() {
  const url = "https://jsonplaceholder.typicode.com/users";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch users. Status: ${response.status}`);
  }

  return response.json();
}

// =====================
// 3) Transform data (unique)
// =====================
// We create a derived metric that is not directly given:
// e.g. company name length, username length, email length
function transformUsers(users, metric) {
  return users.map((u) => {
    const companyName = u.company?.name ?? "";
    const username = u.username ?? "";
    const email = u.email ?? "";

    if (metric === "companyNameLength") return { label: u.name, value: companyName.length };
    if (metric === "usernameLength") return { label: u.name, value: username.length };
    if (metric === "emailLength") return { label: u.name, value: email.length };

    return { label: u.name, value: 0 };
  });
}

// =====================
// 4) Plot with tfjs-vis
// =====================
function plotBarChart(items, metricLabel) {
  const values = items.map((x) => x.value);
  const labels = items.map((x) => x.label);

  const data = {
    values: [values],
    series: [metricLabel],
  };

  const surface = tfvis.visor().surface({ name: "Users Metric Chart", tab: "Charts" });

  tfvis.render.barchart(surface, data, {
    xLabel: "Users",
    yLabel: metricLabel,
    width: 900,
    height: 450,
  });

  // Also show a small table in the visor
  const tableSurface = tfvis.visor().surface({ name: "Transformed Data Table", tab: "Charts" });
  tfvis.render.table(
    tableSurface,
    items.map((x) => ({ user: x.label, value: x.value }))
  );
}

// =====================
// UI Wiring
// =====================
const metricSelect = document.getElementById("metric");
const plotBtn = document.getElementById("plotBtn");
const statusEl = document.getElementById("status");

plotBtn.addEventListener("click", async () => {
  try {
    statusEl.textContent = "Fetching users...";
    const users = await fetchUsers();

    const metric = metricSelect.value;
    const metricLabel =
      metric === "companyNameLength"
        ? "Company name length"
        : metric === "usernameLength"
        ? "Username length"
        : "Email length";

    statusEl.textContent = "Transforming data...";
    const transformed = transformUsers(users, metric);

    statusEl.textContent = "Plotting chart (open TFJS Visor)...";
    plotBarChart(transformed, metricLabel);

    statusEl.textContent = "Done. Open the TFJS Visor (bottom right) to see the chart.";
  } catch (e) {
    console.error(e);
    statusEl.textContent = `Error: ${e.message}`;
  }
});
