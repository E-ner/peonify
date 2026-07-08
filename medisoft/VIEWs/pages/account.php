<section class="mx-auto max-w-5xl px-4 py-12">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-4">
      <div id="me-avatar" class="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-medium text-secondary-foreground">U</div>
      <div>
        <h1 id="me-title" class="font-heading text-3xl font-medium sm:text-4xl">Hello</h1>
        <p id="me-badge" class="text-sm text-muted-foreground"></p>
      </div>
    </div>
    <button id="account-logout-btn" class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm">
      <i data-lucide="log-out"></i>
      Sign out
    </button>
  </div>

  <div class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
    <article class="rounded-xl border bg-card p-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex size-10 items-center justify-center rounded-full bg-secondary"><i data-lucide="package" class="text-primary"></i></span>
        <div><p class="text-xs text-muted-foreground">Total orders</p><p id="account-stat-total" class="font-heading text-2xl leading-none font-semibold">0</p></div>
      </div>
    </article>
    <article class="rounded-xl border bg-card p-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex size-10 items-center justify-center rounded-full bg-secondary"><i data-lucide="truck" class="text-primary"></i></span>
        <div><p class="text-xs text-muted-foreground">Awaiting delivery</p><p id="account-stat-awaiting" class="font-heading text-2xl leading-none font-semibold">0</p></div>
      </div>
    </article>
    <article class="rounded-xl border bg-card p-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex size-10 items-center justify-center rounded-full bg-secondary"><i data-lucide="check-circle-2" class="text-primary"></i></span>
        <div><p class="text-xs text-muted-foreground">Delivered</p><p id="account-stat-delivered" class="font-heading text-2xl leading-none font-semibold">0</p></div>
      </div>
    </article>
    <article class="rounded-xl border bg-card p-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex size-10 items-center justify-center rounded-full bg-secondary"><i data-lucide="wallet" class="text-primary"></i></span>
        <div><p class="text-xs text-muted-foreground">Total spent</p><p id="account-stat-spent" class="font-heading text-2xl leading-none font-semibold">$0</p></div>
      </div>
    </article>
  </div>

  <div class="mt-8 flex flex-wrap gap-2">
    <button class="tab-btn inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm" data-tab="orders"><i data-lucide="package"></i>Orders</button>
    <button class="tab-btn inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm relative" data-tab="notifications"><i data-lucide="bell"></i>Notifications <span id="account-unread-badge" class="hidden rounded-full bg-primary px-1.5 py-[1px] text-[10px] text-primary-foreground">0</span></button>
    <button class="tab-btn inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm" data-tab="support"><i data-lucide="headset"></i>Support</button>
    <button class="tab-btn inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm" data-tab="profile"><i data-lucide="user-round"></i>Profile</button>
  </div>

  <div id="tab-orders" class="tab-panel mt-4 space-y-3">
    <div id="my-orders-empty" class="hidden rounded-xl border bg-card p-8 text-center">
      <p class="text-muted-foreground">No orders yet.</p>
      <a href="/shop" class="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Browse the Boutique</a>
    </div>
    <ul id="my-orders" class="space-y-3"></ul>
  </div>

  <div id="tab-notifications" class="tab-panel mt-4 hidden">
    <div class="mb-3 flex items-center justify-between">
      <p id="account-notif-summary" class="text-sm text-muted-foreground">All caught up</p>
      <button id="mark-all-notifications-btn" class="rounded-md border px-3 py-1.5 text-sm">Mark all as read</button>
    </div>
    <div class="rounded-xl border bg-card p-4">
      <ul id="my-notifications" class="divide-y"></ul>
    </div>
  </div>

  <div id="tab-support" class="tab-panel mt-4 hidden">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
      <div class="rounded-xl border bg-card p-4">
        <h3 class="text-base font-semibold">Customer Support</h3>
        <p class="mt-1 text-sm text-muted-foreground">We reply within one business day.</p>
        <div class="mt-4 space-y-3 text-sm">
          <p class="inline-flex items-center gap-2"><i data-lucide="mail" class="text-primary"></i>hello@peonify.com</p>
          <p class="inline-flex items-center gap-2"><i data-lucide="phone" class="text-primary"></i>+1 (555) 010-2030</p>
        </div>
      </div>
      <div class="rounded-xl border bg-card p-4">
        <h3 class="text-base font-semibold">Send us a message</h3>
        <p id="support-sent-as" class="mt-1 text-sm text-muted-foreground"></p>
        <input id="support-subject" class="mt-4 w-full rounded-md border px-3 py-2" placeholder="Subject" />
        <textarea id="support-body" class="mt-2 w-full rounded-md border p-2" rows="5" placeholder="Message"></textarea>
        <button id="support-send-btn" class="mt-3 rounded-md bg-primary px-4 py-2 text-primary-foreground">Send Message</button>
        <p id="support-result" class="mt-2 text-sm text-muted-foreground"></p>
      </div>
    </div>
  </div>

  <div id="tab-profile" class="tab-panel mt-4 hidden space-y-3 rounded-xl border bg-card p-4">
    <input id="profile-name" class="w-full rounded-md border px-3 py-2" placeholder="Name" />
    <input id="profile-phone" class="w-full rounded-md border px-3 py-2" placeholder="Phone" />
    <input id="profile-address" class="w-full rounded-md border px-3 py-2" placeholder="Address" />
    <input id="profile-city" class="w-full rounded-md border px-3 py-2" placeholder="City" />
    <button id="profile-save-btn" class="rounded-md bg-primary px-4 py-2 text-primary-foreground">Save profile</button>
    <div class="border-t pt-3">
      <input id="current-password" type="password" class="w-full rounded-md border px-3 py-2" placeholder="Current password" />
      <input id="new-password" type="password" class="mt-2 w-full rounded-md border px-3 py-2" placeholder="New password" />
      <button id="password-save-btn" class="mt-2 rounded-md border px-4 py-2">Change password</button>
    </div>
    <div class="border-t pt-3">
      <input id="avatar-file" type="file" class="w-full rounded-md border px-3 py-2" />
      <button id="avatar-upload-btn" class="mt-2 rounded-md border px-4 py-2">Upload avatar</button>
    </div>
    <p id="profile-result" class="text-sm text-muted-foreground"></p>
    <p id="account-security-result" class="text-sm text-muted-foreground"></p>
  </div>
</section>
