<section class="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2">
  <img id="product-image" src="/images/hero.jpg" class="rounded-xl shadow-md product-media-square" alt="product" />
  <div class="flex flex-col justify-center">
    <a href="/shop" class="mb-4 inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent">
      <i data-lucide="arrow-left"></i>
      Back to boutique
    </a>
    <span id="product-collection" class="inline-flex w-fit rounded-md bg-secondary px-2 py-1 text-xs capitalize">collection</span>
    <h1 id="product-name" class="mt-3 font-heading text-4xl font-medium sm:text-5xl">Product</h1>
    <p id="product-description" class="mt-4 text-lg text-muted-foreground"></p>
    <p class="mt-6 flex items-center gap-3 text-2xl font-medium text-primary">
      <span id="product-price">$0.00</span>
      <span id="product-old-price" class="hidden text-base text-muted-foreground line-through">$0.00</span>
      <span id="product-sale-badge" class="hidden rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white">-0%</span>
    </p>
    <hr class="my-6 border-border/70" />
    <p id="product-stock" class="text-sm text-muted-foreground"></p>
    <div id="product-actions" class="mt-4 flex flex-wrap gap-3">
      <button id="product-add-cart-btn" class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-primary-foreground">Add to Cart</button>
      <button id="product-buy-now-btn" class="inline-flex h-9 items-center rounded-md border px-4">Buy Now</button>
    </div>
    <p class="mt-4 text-sm text-muted-foreground">
      Same-day delivery when ordered before 2pm, or schedule a precise window at checkout.
    </p>
  </div>
</section>
<section class="mx-auto max-w-6xl px-4 pb-16">
  <hr class="mb-10 border-border/70" />
  <h2 class="font-heading text-3xl font-medium">Customer Feedback</h2>
  <p id="product-reviews-average" class="mt-1 text-sm text-muted-foreground"></p>
  <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
    <div id="product-reviews-list" class="space-y-4"></div>
    <div class="rounded-xl border bg-card p-4">
      <h3 class="font-heading text-xl">Share your experience</h3>
      <div id="review-stars" class="mt-4 flex gap-1"></div>
      <textarea id="review-comment" class="mt-4 w-full rounded-md border p-2" rows="4" placeholder="How were the flowers? How was the delivery?"></textarea>
      <button id="review-submit-btn" class="mt-3 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">Post Feedback</button>
      <p id="review-result" class="mt-2 text-sm text-muted-foreground"></p>
    </div>
  </div>
</section>
