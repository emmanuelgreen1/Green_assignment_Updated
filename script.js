// script.js
// TFJS Visor Chart: multiply function + fetch users + transform + plot with tfjs-vis

// ---------------------------
// 1) Multiply function
// ---------------------------
function multiplyAll(...args) {
  if (args.length === 0) return 0;

  return args.reduce((product, value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError("multiplyAll only accepts valid numbers");
    }
    return product * value;
  }, 1);
}

// Show multiply result
(function showMultiplyResult() {
  const el = document.getElementById("multiplyResult");
  if (!el) return;

  try {
    el.textContent = `multiplyAll(2, 3, 4, 5) = ${multiplyAll(2, 3, 4, 5)}`;
  } catch (e) {
    el.textContent = e.message;
  }
})();

// ---------------------------
// 2) Remote API call
// ---------------------------
async function fetchUsers() {
  const url = "https://jsonplaceholder.typicode.com/users";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch users. Status: ${response.status}`);
  }

  return response.json();
}

// ---------------------------
// 3) Unique transform (metric options)
// ---------------------------
function computeMetricValue(user, metric) {
  switch (metric) {
    case "companyNameLength":
      return user.company?.name ? user.company.name.length : 0;

    case "usernameLength":
      return user.username ? user.username.length : 0;

    case "cityNameLength":
      return user.address?.city ? user.address.city.length : 0;

    default:
      return 0;
  }
}

// Convert users -> tfjs-vis barchart data
function toBarChartData(users, metric) {
  // tfjs-vis barchart expects: [{ index: "label", value: number }, ...]
  return users.map((u) => ({
    index: u.name,
    value: computeMetricValue(u, metric),
  }));
}

// ---------------------------
// 4) Plot with tfjs-vis
// ---------------------------
async function plotSelectedMetric() {
  const statusEl = document.getElementById("status");
  const metricSelect = document.getElementById("metric");

  // Clear status
  if (statusEl) statusEl.textContent = "";

  try {
    const metric = metricSelect ? metricSelect.value : "companyNameLength";

    const users = await fetchUsers();
    const chartData = toBarChartData(users, metric);

    const surface = { name: "Users Metric Chart", tab: "Charts" };

    // Wipe any previous renders on the same surface
    tfvis.visor().close();
    tfvis.visor().open();

    tfvis.render.barchart(surface, chartData, {
      xLabel: "User",
      yLabel:
        metric === "companyNameLength"
          ? "Company name length"
          : metric === "usernameLength"
          ? "Username length"
          : "City name length",
      height: 420,
    });
  } catch (err) {
    if (statusEl) statusEl.textContent = `Error: ${err.message}`;
    // Also log for debugging
    console.error(err);
  }
}

// ---------------------------
// 5) Wire up button
// ---------------------------
(function init() {
  const btn = document.getElementById("plotBtn");
  if (btn) {
    btn.addEventListener("click", plotSelectedMetric);
  }
})();
