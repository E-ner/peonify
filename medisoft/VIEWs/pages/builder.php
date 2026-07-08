<section class="mx-auto max-w-6xl px-4 py-12">
  <h1 class="font-heading text-4xl font-medium sm:text-5xl">Bouquet Builder</h1>
  <p class="mt-2 text-muted-foreground">Four decisions. One extraordinary arrangement — watch it take shape as you go.</p>
  <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
    <div>
      <div class="h-2 overflow-hidden rounded-full bg-secondary">
        <div id="builder-progress-bar" class="h-full w-1/4 rounded-full bg-primary transition-all duration-300"></div>
      </div>
      <div id="builder-steps" class="mt-4 flex flex-wrap gap-2"></div>
      <div class="mt-8">
        <h2 id="builder-step-title" class="font-heading text-2xl font-medium">Size</h2>
        <p id="builder-step-hint" class="mt-1 text-sm text-muted-foreground">How generous should it be?</p>
        <div id="builder-options" class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"></div>
        <div class="mt-6 flex justify-between">
          <button id="builder-back-btn" class="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm">
            <i data-lucide="arrow-left"></i>
            Back
          </button>
          <button id="builder-next-btn" class="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm">
            Next
            <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="rounded-xl border bg-card p-4 lg:sticky lg:top-20 lg:h-fit">
      <h2 class="inline-flex items-center gap-2 font-heading text-xl">
        <i data-lucide="sparkles" class="text-primary"></i>
        Your Bouquet
      </h2>
      <img id="builder-preview-image" src="/images/petite-poeme.jpg" class="mt-4 aspect-square w-full rounded-2xl object-cover" alt="preview" />
      <div id="builder-summary" class="mt-5 space-y-2 text-sm"></div>
      <hr class="my-4 border-border/70" />
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Total</span>
        <span id="builder-total" class="font-heading text-2xl font-semibold">$0.00</span>
      </div>
      <button id="builder-add-cart-btn" class="mt-4 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">4 steps to go</button>
    </div>
  </div>
</section>
