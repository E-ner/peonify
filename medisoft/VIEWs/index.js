async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Request failed");
  return r.json();
}
async function sendJson(url, method, data = {}) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

function money(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

function renderProducts(products) {
  const root = document.getElementById("products");
  root.innerHTML = "";
  products.forEach((p) => {
    const sale = Number(p.discount_percent || 0);
    const final = sale > 0 ? Math.round(p.price_cents * (100 - sale) / 100) : p.price_cents;
    const el = document.createElement("article");
    el.className = "overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";
    el.innerHTML = `
      <img src="${p.image_url || "/images/hero.jpg"}" alt="${p.name}" class="aspect-[4/3] w-full object-cover">
      <div class="p-4">
        <h3 class="font-heading text-xl">${p.name}</h3>
        <p class="mt-1 text-sm text-muted-foreground">${p.description}</p>
        <p class="mt-3 text-base font-semibold text-primary">${money(final)} ${sale > 0 ? `<small class="ml-2 text-xs text-muted-foreground line-through">${money(p.price_cents)}</small>` : ""}</p>
        <button class="mt-3 inline-flex rounded-md bg-primary px-3 py-2 text-primary-foreground add-cart-btn">Add to Cart</button>
      </div>
    `;
    el.querySelector(".add-cart-btn").addEventListener("click", async () => {
      await sendJson("index.php?route=api/cart/add", "POST", {
        product_id: p.id,
        name: p.name,
        quantity: 1,
        unit_price_cents: final,
      });
      await loadCart();
    });
    root.appendChild(el);
  });
}

function renderCharts(metrics) {
  const rev = metrics.revenue_by_day || [];
  if (window.revenueChartObj) window.revenueChartObj.destroy();
  window.revenueChartObj = new Chart(document.getElementById("revenueChart"), {
    type: "line",
    data: {
      labels: rev.map((r) => r.day),
      datasets: [{ label: "Revenue", data: rev.map((r) => Number(r.revenue_cents) / 100), borderColor: "#5b2a52", backgroundColor: "rgba(91,42,82,.15)" }]
    }
  });

  if (window.statusChartObj) window.statusChartObj.destroy();
  window.statusChartObj = new Chart(document.getElementById("statusChart"), {
    type: "bar",
    data: {
      labels: (metrics.orders_by_status || []).map((s) => s.status),
      datasets: [{ label: "Orders", data: (metrics.orders_by_status || []).map((s) => s.count), backgroundColor: "#cd8d2f" }]
    }
  });

  const top = document.getElementById("top-products");
  top.innerHTML = "";
  (metrics.top_products || []).forEach((p) => {
    const li = document.createElement("li");
    li.className = "py-2 border-b text-sm";
    li.textContent = `${p.name} — ${p.sold} sold`;
    top.appendChild(li);
  });
}

function setupHero3D() {
  const frame = document.getElementById("hero-3d");
  const card = document.getElementById("hero-card");
  frame.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${py * -10}deg) rotateY(${px * 14}deg)`;
  });
  frame.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

function renderCart(items) {
  const list = document.getElementById("cart-list");
  const totalEl = document.getElementById("cart-total");
  list.innerHTML = "";
  let total = 0;
  items.forEach((it) => {
    total += Number(it.unit_price_cents) * Number(it.quantity);
    const li = document.createElement("li");
    li.className = "py-2 border-b text-sm";
    li.textContent = `${it.quantity}x ${it.name} — ${money(Number(it.unit_price_cents) * Number(it.quantity))}`;
    list.appendChild(li);
  });
  totalEl.textContent = money(total);
}

async function loadCart() {
  const cart = await getJson("index.php?route=api/cart");
  renderCart(cart.items || []);
}

function renderList(id, rows, formatter) {
  const root = document.getElementById(id);
  root.innerHTML = "";
  rows.forEach((r) => {
    const li = document.createElement("li");
    li.className = "py-2 border-b text-sm";
    li.textContent = formatter(r);
    root.appendChild(li);
  });
}

async function loadMe() {
  const badge = document.getElementById("me-badge");
  try {
    const me = await getJson("index.php?route=api/auth/me");
    badge.textContent = `Logged in: ${me.user.name} (${me.user.role})`;
    document.getElementById("checkout-name").value = me.user.name || "";
    document.getElementById("checkout-email").value = me.user.email || "";

    const [orders, notes] = await Promise.all([
      getJson("index.php?route=api/me/orders"),
      getJson("index.php?route=api/me/notifications"),
    ]);
    renderList("my-orders", orders, (o) => `${o.reference} — ${o.status} — ${money(o.total_cents)}`);
    renderList("my-notifications", notes, (n) => `${n.title}: ${n.body}`);

    if (me.user.role === "admin") {
      const adminOrders = await getJson("index.php?route=api/admin/orders");
      renderList("admin-orders", adminOrders, (o) => `${o.reference} — ${o.customer_name} — ${o.status}`);
    }
  } catch {
    badge.textContent = "Not logged in";
    renderList("my-orders", [], () => "");
    renderList("my-notifications", [], () => "");
    renderList("admin-orders", [], () => "");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentPage = new URLSearchParams(window.location.search).get("page") || "home";
  document.querySelectorAll("[data-page]").forEach((el) => {
    if (el.getAttribute("data-page") !== currentPage && !(currentPage === "home" && el.getAttribute("data-page") === "home")) {
      el.style.display = "none";
    }
  });

  setupHero3D();
  document.getElementById("open-cart-btn").addEventListener("click", loadCart);
  document.getElementById("clear-cart-btn").addEventListener("click", async () => {
    await sendJson("index.php?route=api/cart/clear", "POST");
    await loadCart();
  });

  document.getElementById("login-btn").addEventListener("click", async () => {
    try {
      await sendJson("index.php?route=api/auth/login", "POST", {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
      });
      await loadMe();
    } catch (e) {
      alert(e.message);
    }
  });

  document.getElementById("signup-btn").addEventListener("click", async () => {
    try {
      await sendJson("index.php?route=api/auth/signup", "POST", {
        name: document.getElementById("signup-name").value,
        email: document.getElementById("signup-email").value,
        password: document.getElementById("signup-password").value,
      });
      await loadMe();
    } catch (e) {
      alert(e.message);
    }
  });

  document.getElementById("checkout-btn").addEventListener("click", async () => {
    try {
      const order = await sendJson("index.php?route=api/orders/checkout", "POST", {
        customer_name: document.getElementById("checkout-name").value,
        email: document.getElementById("checkout-email").value,
      });
      document.getElementById("checkout-result").textContent = `Order created: ${order.reference}`;
      await loadCart();
      await loadMe();
    } catch (e) {
      document.getElementById("checkout-result").textContent = e.message;
    }
  });

  document.getElementById("seed-everything-btn").addEventListener("click", async () => {
    try {
      await sendJson("index.php?route=api/seed/everything", "POST", {});
      const [products, metrics] = await Promise.all([
        getJson("index.php?route=api/products"),
        getJson("index.php?route=api/metrics"),
      ]);
      renderProducts(products);
      renderCharts(metrics);
      await loadCart();
      await loadMe();
      document.getElementById("checkout-result").textContent = "Seed complete.";
    } catch (e) {
      document.getElementById("checkout-result").textContent = e.message;
    }
  });

  try {
    const [products, metrics] = await Promise.all([
      getJson("index.php?route=api/products"),
      getJson("index.php?route=api/metrics"),
    ]);
    renderProducts(products);
    renderCharts(metrics);
    await loadCart();
    await loadMe();
  } catch (e) {
    console.error(e);
  }
});
