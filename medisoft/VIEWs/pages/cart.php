<section class="mx-auto max-w-3xl px-4 py-12">
  <div id="cart-empty" class="hidden px-4 py-20 text-center">
    <i data-lucide="shopping-bag" class="mx-auto text-muted-foreground" style="width:2.5rem;height:2.5rem;"></i>
    <h1 class="mt-4 font-heading text-4xl font-medium">Your Cart</h1>
    <p class="mt-2 text-muted-foreground">Your cart is empty - it deserves better.</p>
    <a href="/shop" class="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Browse the Boutique</a>
  </div>

  <div id="cart-main">
    <h1 class="font-heading text-4xl font-medium sm:text-5xl">Your Cart</h1>
    <div class="mt-8 rounded-xl border bg-card p-4 py-2">
      <ul id="cart-list" class="divide-y"></ul>
    </div>
    <hr class="my-6 border-border/70" />
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span class="font-heading text-2xl font-semibold">Total <span id="cart-total">$0.00</span></span>
      <div class="text-right">
        <a href="/checkout" id="cart-checkout-btn" class="inline-flex h-10 items-center rounded-md bg-primary px-4 text-primary-foreground">Proceed to Checkout</a>
        <p id="cart-auth-note" class="mt-1 hidden text-xs text-muted-foreground">An account is required to place an order.</p>
      </div>
    </div>
  </div>
</section>
