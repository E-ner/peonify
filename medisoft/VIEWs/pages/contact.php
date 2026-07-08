<section class="mx-auto max-w-5xl px-4 py-16">
  <h1 class="font-heading text-5xl font-medium">Contact Us</h1>
  <p class="mt-3 max-w-xl text-muted-foreground">
    Questions about an order, a special event, or anything else — we're here to help.
  </p>

  <div class="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
    <div class="space-y-4">
      <div class="flex items-center gap-3 text-sm">
        <span class="inline-flex size-9 items-center justify-center rounded-full bg-secondary"><i data-lucide="mail" class="text-primary"></i></span>
        hello@peonify.com
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="inline-flex size-9 items-center justify-center rounded-full bg-secondary"><i data-lucide="phone" class="text-primary"></i></span>
        +1 (555) 010-2030
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="inline-flex size-9 items-center justify-center rounded-full bg-secondary"><i data-lucide="map-pin" class="text-primary"></i></span>
        12 Bloom Street, Portland, OR
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="inline-flex size-9 items-center justify-center rounded-full bg-secondary"><i data-lucide="clock-3" class="text-primary"></i></span>
        Mon-Sat, 8am - 6pm
      </div>
    </div>

    <div class="rounded-xl border bg-card">
      <div id="contact-form-wrap" class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div class="space-y-2">
          <label for="contact-name" class="text-sm font-medium">Name</label>
          <input id="contact-name" class="w-full rounded-md border px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label for="contact-email" class="text-sm font-medium">Email</label>
          <input id="contact-email" type="email" class="w-full rounded-md border px-3 py-2" required />
        </div>
        <div class="space-y-2 sm:col-span-2">
          <label for="contact-subject" class="text-sm font-medium">Subject (optional)</label>
          <input id="contact-subject" class="w-full rounded-md border px-3 py-2" placeholder="Wedding flowers for October" />
        </div>
        <div class="space-y-2 sm:col-span-2">
          <label for="contact-body" class="text-sm font-medium">Message</label>
          <textarea id="contact-body" class="w-full rounded-md border p-2" rows="5" required></textarea>
        </div>
        <button id="contact-send-btn" class="sm:col-span-2 rounded-md bg-primary px-4 py-2 text-primary-foreground">Send Message</button>
        <p id="contact-result" class="sm:col-span-2 text-sm text-muted-foreground"></p>
      </div>
      <div id="contact-thanks" class="hidden p-10 text-center">
        <p class="font-heading text-2xl font-medium">Thank you 🌸</p>
        <p class="mt-2 text-sm text-muted-foreground">
          Your message is in our inbox — we'll reply within one business day.
        </p>
      </div>
    </div>
  </div>
</section>
