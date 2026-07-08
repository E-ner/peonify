<section class="mx-auto max-w-6xl px-4 py-12">
  <h1 class="font-heading text-4xl font-medium sm:text-5xl">The Boutique</h1>
  <div class="mt-8 flex flex-wrap items-center gap-3">
    <div class="shop-tabs-list inline-flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-1">
    <button class="shop-cat-btn inline-flex rounded-md border px-3 py-1.5 text-[0.8rem]" data-category="all">All</button>
    <button class="shop-cat-btn inline-flex rounded-md border px-3 py-1.5 text-[0.8rem]" data-category="bouquet">Bouquets</button>
    <button class="shop-cat-btn inline-flex rounded-md border px-3 py-1.5 text-[0.8rem]" data-category="arrangement">Arrangements</button>
    <button class="shop-cat-btn inline-flex rounded-md border px-3 py-1.5 text-[0.8rem]" data-category="stems">Premium Stems</button>
    </div>
    <div class="relative min-w-48 flex-1 sm:max-w-64">
      <i data-lucide="search" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"></i>
      <input id="shop-search" class="w-full rounded-lg border px-3 py-2 pl-9 text-sm" placeholder="Search flowers…" />
    </div>
  </div>
  <div class="mt-3 flex flex-wrap items-center gap-2">
    <select id="shop-collection" class="w-44 rounded-lg border px-2.5 py-1.5 text-sm">
      <option value="all">All collections</option>
      <option value="signature">Signature Collection</option>
      <option value="spring">Spring Collection</option>
      <option value="summer">Summer Collection</option>
    </select>
    <select id="shop-sort" class="w-44 rounded-lg border px-2.5 py-1.5 text-sm">
      <option value="newest">Newest first</option>
      <option value="price_asc">Price: low to high</option>
      <option value="price_desc">Price: high to low</option>
    </select>
    <button id="shop-sale-toggle" class="inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[0.8rem]">
      <i data-lucide="flame" class="text-primary"></i>
      On sale
    </button>
  </div>
  <div id="products" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"></div>
  <div class="mt-6 flex items-center justify-between">
    <button id="shop-prev" class="inline-flex rounded-md border px-3 py-2">Prev</button>
    <p id="shop-page-label" class="text-sm text-muted-foreground">Page 1</p>
    <button id="shop-next" class="inline-flex rounded-md border px-3 py-2">Next</button>
  </div>
</section>
