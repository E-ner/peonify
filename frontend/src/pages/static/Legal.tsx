// Terms of Service and Privacy Policy — plain-language legal pages.

function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl font-medium">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="prose-peonify mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function Terms() {
  return (
    <LegalShell title="Terms & Conditions" updated="July 2, 2026">
      <div>
        <h2>1. Who we are</h2>
        <p>
          Peonify ("we", "us") operates this website and delivers floral
          arrangements to the addresses our customers provide. By placing an
          order or creating an account you agree to these terms.
        </p>
      </div>
      <div>
        <h2>2. Orders & payment</h2>
        <p>
          An order is confirmed when you receive an order reference. Prices are
          shown in USD and include the arrangement and standard packaging;
          delivery is free within our service area. Payment is collected at
          checkout through our payment provider.
        </p>
      </div>
      <div>
        <h2>3. Delivery & shipments</h2>
        <p>
          We deliver inside the time window you choose at checkout. Same-day
          delivery is available for orders placed before 2pm. If nobody is
          available at the address, our courier will follow the instructions in
          your order notes or contact the phone number provided. Shipment
          progress is updated by our team and visible in your account.
        </p>
      </div>
      <div>
        <h2>4. Freshness guarantee & refunds</h2>
        <p>
          Flowers are perishable and each arrangement is made to order. If your
          flowers arrive damaged or wilt within 48 hours, contact us with a
          photo and we will replace the arrangement or refund you in full.
          Because arrangements are prepared the morning of delivery, orders can
          be cancelled free of charge until 8pm the evening before the delivery
          date.
        </p>
      </div>
      <div>
        <h2>5. Accounts</h2>
        <p>
          You are responsible for keeping your password confidential. We may
          suspend accounts used fraudulently. You can ask us to delete your
          account and data at any time.
        </p>
      </div>
      <div>
        <h2>6. Reviews & content</h2>
        <p>
          Reviews must relate to a genuine experience with our products. We may
          remove content that is offensive, misleading, or unrelated.
        </p>
      </div>
      <div>
        <h2>7. Liability & changes</h2>
        <p>
          Our liability for any order is limited to the amount you paid for it.
          We may update these terms; material changes will be announced on this
          page. Questions? Contact hello@peonify.com.
        </p>
      </div>
    </LegalShell>
  );
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2, 2026">
      <div>
        <h2>1. What we collect</h2>
        <p>
          Account details (name, email, delivery address, phone), order history,
          and any messages you send us. Payment card details are handled by our
          payment provider and never touch our servers.
        </p>
      </div>
      <div>
        <h2>2. How we use it</h2>
        <p>
          To prepare and deliver your orders, keep you signed in, notify you
          about shipment progress, and answer your messages. We do not sell
          your data or use third-party advertising trackers.
        </p>
      </div>
      <div>
        <h2>3. Cookies</h2>
        <p>
          We use essential cookies only: one to keep you signed in and local
          storage to remember your cart and cookie preference. No analytics or
          marketing cookies are set.
        </p>
      </div>
      <div>
        <h2>4. Sharing</h2>
        <p>
          Delivery details are shared with our couriers solely to complete your
          delivery. We disclose data only when required by law.
        </p>
      </div>
      <div>
        <h2>5. Your rights</h2>
        <p>
          You can view and edit your profile in your account, and request a copy
          or deletion of your data by emailing hello@peonify.com. We respond
          within 30 days.
        </p>
      </div>
    </LegalShell>
  );
}
