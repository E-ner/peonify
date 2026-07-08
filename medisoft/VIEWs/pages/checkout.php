<section class="mx-auto max-w-5xl px-4 py-12">
  <div id="checkout-admin" class="hidden mx-auto max-w-3xl py-20 text-center">
    <h1 class="font-heading text-4xl font-medium">Checkout</h1>
    <p class="mt-2 text-muted-foreground">Admin accounts manage the shop — they can't place orders. Sign in with a customer account to buy.</p>
    <a href="/admin" class="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-primary-foreground">Back to Admin Dashboard</a>
  </div>
  <div id="checkout-empty" class="hidden mx-auto max-w-3xl py-20 text-center">
    <h1 class="font-heading text-4xl font-medium">Checkout</h1>
    <p class="mt-2 text-muted-foreground">Your cart is empty.</p>
    <a href="/shop" class="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-primary-foreground">Browse the Boutique</a>
  </div>
  <div id="checkout-main">
    <h1 class="font-heading text-4xl font-medium sm:text-5xl">Checkout</h1>
    <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div class="space-y-6">
        <div class="rounded-xl border bg-card">
          <div class="space-y-1 p-5 pb-2">
            <h2 class="inline-flex items-center gap-2 text-lg font-semibold"><span class="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>Recipient</h2>
            <p class="text-sm text-muted-foreground">Who is receiving the flowers?</p>
          </div>
          <div class="grid grid-cols-1 gap-4 p-5 pt-3 sm:grid-cols-2">
            <div class="space-y-2">
              <label for="checkout-name" class="text-sm font-medium">Full name</label>
              <input id="checkout-name" class="w-full rounded-md border px-3 py-2" placeholder="Amara Chen" />
            </div>
            <div class="space-y-2">
              <label for="checkout-email" class="text-sm font-medium">Email</label>
              <input id="checkout-email" type="email" class="w-full rounded-md border px-3 py-2" placeholder="amara@example.com" />
            </div>
            <div class="space-y-2">
              <label for="checkout-phone" class="text-sm font-medium">Phone (optional)</label>
              <input id="checkout-phone" class="w-full rounded-md border px-3 py-2" placeholder="+1 555 000 0000" />
            </div>
            <div class="space-y-2 sm:col-span-2">
              <label for="checkout-address" class="text-sm font-medium">Delivery address</label>
              <input id="checkout-address" class="w-full rounded-md border px-3 py-2" placeholder="12 Bloom Street, Apt 4, Portland OR" />
            </div>
            <div class="space-y-2 sm:col-span-2">
              <label for="checkout-note" class="text-sm font-medium">Gift note (optional)</label>
              <textarea id="checkout-note" class="w-full rounded-md border p-2" rows="3" placeholder="Happy anniversary — these reminded me of you."></textarea>
            </div>
          </div>
        </div>
        <div class="rounded-xl border bg-card">
          <div class="space-y-1 p-5 pb-2">
            <h2 class="inline-flex items-center gap-2 text-lg font-semibold"><span class="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>Delivery</h2>
            <p class="text-sm text-muted-foreground">Choose today for same-day delivery, or pick a future date and a time window that suits.</p>
          </div>
          <div class="space-y-5 p-5 pt-3">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="checkout-radio-card flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                <input type="radio" name="order-type" value="on_demand" checked class="mt-0.5" />
                <span><span class="block font-medium">On-demand</span><span class="mt-1 block text-sm font-normal text-muted-foreground">Delivered today</span></span>
              </label>
              <label class="checkout-radio-card flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                <input type="radio" name="order-type" value="scheduled" class="mt-0.5" />
                <span><span class="block font-medium">Scheduled</span><span class="mt-1 block text-sm font-normal text-muted-foreground">Pick a future date — events & anniversaries</span></span>
              </label>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div id="checkout-date-wrap" class="hidden space-y-2">
                <label for="delivery-date" class="text-sm font-medium">Delivery date</label>
                <input id="delivery-date" type="date" class="w-full rounded-md border px-3 py-2" />
                <p class="text-xs text-muted-foreground">We'll remind you the day before and again 5 hours before delivery.</p>
              </div>
              <div class="space-y-2">
                <label for="delivery-window" class="text-sm font-medium">Delivery window</label>
                <select id="delivery-window" class="w-full rounded-md border px-3 py-2"><option value="">Select a window</option><option>09:00 - 12:00</option><option>12:00 - 15:00</option><option>15:00 - 18:00</option><option>18:00 - 21:00</option></select>
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-xl border bg-card">
          <div class="space-y-1 p-5">
            <h2 class="inline-flex items-center gap-2 text-lg font-semibold"><span class="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span><i data-lucide="credit-card"></i>Payment</h2>
            <p class="text-sm text-muted-foreground">Payments run in demo mode — no card required.</p>
          </div>
          <div class="px-5 pb-5">
            <div class="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground"><i data-lucide="lock"></i>Demo mode active — your order is marked paid instantly.</div>
          </div>
        </div>
      </div>
      <div class="rounded-xl border bg-card p-5 lg:sticky lg:top-20 lg:h-fit">
        <h2 class="text-lg font-semibold">Order Summary</h2>
        <ul id="checkout-cart-list" class="mt-3 divide-y"></ul>
        <hr class="my-4 border-border/70" />
        <div class="flex justify-between">
          <span class="font-medium">Total</span>
          <span class="font-heading text-xl font-semibold"><span id="checkout-total">$0.00</span></span>
        </div>
        <button id="checkout-btn" class="mt-4 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">Place Order</button>
        <p class="mt-2 text-center text-xs text-muted-foreground">You can follow the shipment from your account.</p>
        <p id="checkout-result" class="mt-2 text-sm text-muted-foreground"></p>
      </div>
    </div>
  </div>
</section>
