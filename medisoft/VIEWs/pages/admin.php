<section class="mx-auto max-w-7xl px-4 py-8">
  <div class="mb-6 flex items-center justify-between">
    <h1 class="font-heading text-3xl font-medium">Admin Dashboard</h1>
    <div class="flex gap-2">
      <button id="seed-everything-btn" class="rounded-md border px-3 py-2">Seed Everything</button>
      <a href="/index.php?page=shop" class="rounded-md border px-3 py-2">Storefront</a>
    </div>
  </div>
  <div class="grid grid-cols-2 gap-4 xl:grid-cols-5">
    <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">Revenue</p><p id="admin-stat-revenue" class="font-heading text-2xl">$0</p></div>
    <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">Orders</p><p id="admin-stat-orders" class="font-heading text-2xl">0</p></div>
    <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">To deliver</p><p id="admin-stat-active" class="font-heading text-2xl">0</p></div>
    <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">Products</p><p id="admin-stat-products" class="font-heading text-2xl">0</p></div>
    <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">Customers</p><p id="admin-stat-customers" class="font-heading text-2xl">0</p></div>
  </div>
  <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
    <div class="rounded-xl border bg-card p-4 xl:col-span-2"><canvas id="revenueChart"></canvas></div>
    <div class="rounded-xl border bg-card p-4"><canvas id="statusChart"></canvas></div>
  </div>
  <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
    <div class="rounded-xl border bg-card p-4"><h2 class="font-heading text-xl">Top sellers</h2><ul id="top-products" class="mt-2 divide-y"></ul></div>
    <div class="rounded-xl border bg-card p-4"><h2 class="font-heading text-xl">Orders</h2><ul id="admin-orders" class="mt-2 divide-y"></ul></div>
    <div class="rounded-xl border bg-card p-4"><h2 class="font-heading text-xl">Reviews</h2><ul id="admin-reviews" class="mt-2 divide-y"></ul></div>
    <div class="rounded-xl border bg-card p-4"><h2 class="font-heading text-xl">Inbox</h2><ul id="admin-messages" class="mt-2 divide-y"></ul></div>
    <div class="rounded-xl border bg-card p-4 xl:col-span-2"><h2 class="font-heading text-xl">Activity</h2><ul id="admin-activity" class="mt-2 divide-y"></ul></div>
  </div>
  <div class="mt-6 rounded-xl border bg-card p-4">
    <h2 class="font-heading text-xl">Upload product image</h2>
    <input id="admin-upload-file" type="file" class="mt-2 w-full rounded-md border px-3 py-2" />
    <button id="admin-upload-btn" class="mt-2 rounded-md border px-3 py-2">Upload</button>
    <p id="admin-upload-result" class="mt-2 text-sm text-muted-foreground"></p>
  </div>
</section>
