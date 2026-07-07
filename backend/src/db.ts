import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/peonify",
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,          -- bouquet | stems | arrangement
  collection  TEXT NOT NULL,          -- spring | summer | signature
  price_cents INTEGER NOT NULL,
  hue         INTEGER NOT NULL DEFAULT 340,  -- accent hue for product art fallback
  image_url   TEXT NOT NULL DEFAULT '',
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS builder_options (
  id          SERIAL PRIMARY KEY,
  step        TEXT NOT NULL,          -- size | focal | foliage | packaging
  name        TEXT NOT NULL,
  detail      TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  reference       TEXT UNIQUE NOT NULL,
  customer_name   TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL DEFAULT '',
  address         TEXT NOT NULL,
  delivery_date   DATE NOT NULL,
  delivery_window TEXT NOT NULL,      -- e.g. "09:00 - 12:00"
  order_type      TEXT NOT NULL,      -- on_demand | scheduled
  gift_note       TEXT NOT NULL DEFAULT '',
  total_cents     INTEGER NOT NULL,
  payment_ref     TEXT NOT NULL DEFAULT '',   -- Stripe PaymentIntent id once integrated
  status          TEXT NOT NULL DEFAULT 'received',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  custom_config    JSONB,
  quantity         INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS order_events (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer',  -- customer | admin
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  slug  TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collections (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  link       TEXT NOT NULL DEFAULT '',
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Migrate pre-existing databases: allow product deletion without breaking
-- historical order lines.
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminded_1d BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reminded_5h BOOLEAN NOT NULL DEFAULT FALSE;

-- Customer profile fields (avatar + default delivery location for shipments)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone      TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS address    TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS city       TEXT NOT NULL DEFAULT '';

-- Subscriptions were removed from the product to keep the system simple.
DROP TABLE IF EXISTS subscriptions;
`;

type ProductSeed = [string, string, string, string, string, number, number];
type OptionSeed = [string, string, string, number];

const PRODUCTS: ProductSeed[] = [
  ["blush-peony-dream", "Blush Peony Dream", "A cloud of hand-selected blush peonies at peak bloom, wrapped in silk-touch ivory paper.", "bouquet", "signature", 12900, 345],
  ["coral-charm-cascade", "Coral Charm Cascade", "Coral Charm peonies fading from vivid coral to soft apricot, with trailing eucalyptus.", "bouquet", "signature", 14500, 15],
  ["ivory-noir", "Ivory Noir", "Pure white peonies against deep burgundy foliage — dramatic, architectural, unforgettable.", "arrangement", "signature", 18900, 320],
  ["garden-whisper", "Garden Whisper", "A loose, garden-gathered arrangement of peonies, garden roses and sweet pea.", "arrangement", "spring", 9800, 300],
  ["sarah-bernhardt-stems", "Sarah Bernhardt Stems", "Ten stems of the queen of peonies — ruffled, fragrant, rose-pink. Sold by the bunch.", "stems", "spring", 6500, 335],
  ["duchesse-blanche-stems", "Duchesse Blanche Stems", "Ten stems of pristine white Duchesse de Nemours, lightly lemon-scented.", "stems", "spring", 7200, 60],
  ["golden-hour", "Golden Hour", "Amber garden roses, butterscotch ranunculus and golden solidago in a low ceramic vessel.", "arrangement", "summer", 11200, 40],
  ["provence-morning", "Provence Morning", "Lavender, white peonies and olive branches — the south of France in a bouquet.", "bouquet", "summer", 8900, 270],
  ["velvet-crush", "Velvet Crush", "Deep magenta peonies with plum dahlias and smoke bush, tied with velvet ribbon.", "bouquet", "summer", 13400, 310],
  ["petite-poeme", "Petite Poème", "A small but perfectly formed posy of peonies and lisianthus. Ideal for desks and thank-yous.", "bouquet", "spring", 5400, 350],
];

const BUILDER_OPTIONS: OptionSeed[] = [
  ["size", "Petite", "8 stems", 4500],
  ["size", "Classic", "14 stems", 7500],
  ["size", "Grand", "22 stems", 11500],
  ["size", "Opulent", "34 stems", 16900],
  ["focal", "Blush Peony", "Soft pink, ruffled", 0],
  ["focal", "Coral Charm Peony", "Vivid coral fading to apricot", 800],
  ["focal", "White Peony", "Pure ivory Duchesse", 600],
  ["focal", "Garden Rose", "Fragrant, old-world", 400],
  ["foliage", "Silver Eucalyptus", "Cool grey-green", 0],
  ["foliage", "Olive Branch", "Mediterranean, wild", 500],
  ["foliage", "Ruscus & Fern", "Deep green, structured", 300],
  ["foliage", "None", "Blooms only", 0],
  ["packaging", "Ivory Silk Wrap", "Signature hand-tied wrap", 0],
  ["packaging", "Black Boutique Box", "Rigid keepsake box", 1500],
  ["packaging", "Ceramic Vessel", "Reusable artisan vase", 3500],
];

export async function initDb(): Promise<void> {
  await pool.query(SCHEMA);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM products");
  if (rows[0].n === 0) {
    for (const p of PRODUCTS) {
      await pool.query(
        `INSERT INTO products (slug, name, description, category, collection, price_cents, hue, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7, '/images/' || $1 || '.jpg')`,
        p
      );
    }
    for (const o of BUILDER_OPTIONS) {
      await pool.query(
        `INSERT INTO builder_options (step, name, detail, price_cents)
         VALUES ($1,$2,$3,$4)`,
        o
      );
    }
    // Demo flash-sale pricing
    await pool.query(`
      UPDATE products SET discount_percent = CASE slug
        WHEN 'velvet-crush' THEN 20
        WHEN 'golden-hour' THEN 15
        WHEN 'petite-poeme' THEN 10
        ELSE 0 END
      WHERE slug IN ('velvet-crush','golden-hour','petite-poeme')`);
    console.log("Seeded products and builder options");
  }

  // Seed categories & collections (idempotent) so the admin can manage them.
  for (const [slug, name] of [
    ["bouquet", "Bouquets"],
    ["arrangement", "Arrangements"],
    ["stems", "Premium Stems"],
  ]) {
    await pool.query(
      "INSERT INTO categories (slug, name) VALUES ($1,$2) ON CONFLICT (slug) DO NOTHING",
      [slug, name]
    );
  }
  for (const [slug, name, description] of [
    ["signature", "Signature", "Our house icons, perfected over seasons."],
    ["spring", "Spring", "Peonies at their fleeting, ruffled best."],
    ["summer", "Summer", "Sun-drenched tones for golden evenings."],
  ]) {
    await pool.query(
      "INSERT INTO collections (slug, name, description) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING",
      [slug, name, description]
    );
  }

  // Migrate any orders from the old multi-stage pipeline to the simple
  // paid → delivered flow.
  await pool.query(
    "UPDATE orders SET status = 'paid' WHERE status NOT IN ('paid','delivered')"
  );

  // Backfill bundled images onto already-seeded rows (e.g. a DB created
  // before image support was added). Only touches the known seed slugs.
  await pool.query(
    `UPDATE products SET image_url = '/images/' || slug || '.jpg'
     WHERE image_url = '' AND slug = ANY($1)`,
    [PRODUCTS.map((p) => p[0])]
  );
}
