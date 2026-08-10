# -*- coding: utf-8 -*- (concatenated after build_report_1.py)

# ╔══════════════════════════ CHAPTER 3 ══════════════════════════╗
doc.add_heading("CHAPTER 3", level=1)
doc.add_heading("REQUIREMENTS ANALYSIS AND DESIGN OF THE NEW SYSTEM", level=1)

doc.add_heading("3.1 Introduction", level=2)
p("This chapter translates the requirements established in Chapter 2 into a concrete "
  "design. It first explains the analysis methodology and the development process "
  "followed, then presents the system through a sequence of UML models — the use case "
  "model with detailed use case descriptions, the class model, the checkout sequence and "
  "the order life cycle — before describing the relational database design and the "
  "overall system architecture. All diagrams in this chapter are drawn as native, "
  "editable drawings; the database schema is presented as captured from the phpMyAdmin "
  "Designer of the live system.")

doc.add_heading("3.2 Object-Oriented Methodology", level=2)
p("Object-Oriented Analysis and Design was selected because the domain decomposes "
  "naturally into cooperating entities with clear responsibilities: users who "
  "authenticate and maintain profiles; products that carry pricing and presentation; "
  "orders that bind customers, items and delivery details together; and services that "
  "cut across entities, such as notification delivery. During analysis, use case "
  "modelling captured what each actor must be able to accomplish without prescribing "
  "how. During design, class modelling assigned each responsibility to exactly one "
  "entity, and sequence modelling verified that the entities could collaborate to "
  "fulfil the most important scenario — checkout — without gaps or ambiguity. The "
  "resulting model maps directly onto the relational schema of Section 3.9.")

doc.add_heading("3.3 Software Development Process", level=2)
p("The Agile iterative model governed construction. Each iteration selected a coherent "
  "slice of functionality, implemented it across all three tiers, and ended with "
  "functional testing and a review against the entrepreneur’s expectations. Two design "
  "corrections illustrate the value of this discipline. First, an early design carried a "
  "six-stage fulfilment pipeline; owner review showed that the intermediate stages "
  "created work without informing anyone, and the pipeline was simplified to the single "
  "paid-to-delivered transition that shipped. Second, delivery confirmation was initially "
  "an administrator-only action; observation showed that customers often receive flowers "
  "before the administrator updates the system, so a customer-side “I received it” "
  "confirmation was added. Figure 2 presents the four-month project timeline.")
diagram(dg.gantt, "Project timeline — Gantt chart across four months")

doc.add_heading("3.4 Use Case Diagram", level=2)
p("Figure 3 presents the use case model. Three human actors interact with the system. "
  "The Guest browses the catalogue, explores the bouquet builder and may register or "
  "log in. The Customer, once authenticated, gains the commercial capabilities: checkout "
  "and payment, delivery confirmation, product feedback, profile management, support "
  "contact and notifications. The Administrator operates the boutique: product and "
  "catalogue management, promotional discounts, order delivery, analytics, feedback "
  "moderation, the support inbox and the activity audit. Guests inherit nothing that "
  "requires identity; customers inherit all guest capabilities.")
diagram(dg.usecase, "Use case diagram of the Peonify web system")

doc.add_heading("3.5 Use Case Descriptions", level=2)
p("The eight most significant use cases are specified below in the standard tabular "
  "form: actors, preconditions, the main flow and postconditions.")
UC = [
    ("Register", "Guest",
     "The visitor has no account.",
     "1. The guest opens the registration page. 2. The guest enters full name, email, "
     "password and password confirmation, with visibility toggles available. 3. The "
     "system validates the email format, the minimum password length of eight "
     "characters, and the match between password and confirmation. 4. The system stores "
     "the account with a bcrypt hash and starts a session. 5. The new customer is "
     "greeted on their account dashboard.",
     "A customer account exists and is signed in."),
    ("Login", "Guest (becoming Customer or Administrator)",
     "A registered account exists.",
     "1. The user opens the login page. 2. The user submits email and password. 3. The "
     "system verifies the bcrypt hash, regenerates the session identifier and stores "
     "the user identity in the session. 4. The system redirects to the dashboard "
     "matching the account’s role.",
     "An authenticated session exists; the notification badge reflects unread items."),
    ("Browse and Search the Shop", "Guest / Customer",
     "None.",
     "1. The visitor opens the shop. 2. The visitor optionally narrows the view with "
     "the text search, a category chip, the collection filter, a price range or the "
     "sale-only filter, and chooses a sort order. 3. The system applies all criteria, "
     "recomputes discounted prices, and presents a paginated grid with badges for new "
     "and discounted arrangements.",
     "The visitor views the matching subset of the catalogue."),
    ("Build a Custom Bouquet", "Guest / Customer",
     "None.",
     "1. The visitor opens the bouquet builder. 2. The visitor selects one option in "
     "each of four steps: size, focal flower, foliage and packaging. 3. With each "
     "selection the system updates a live photographic preview and a per-step price "
     "breakdown. 4. When all four steps are chosen, the visitor adds the configured "
     "bouquet to the cart.",
     "A custom bouquet with its configuration and computed price is in the cart."),
    ("Checkout and Pay", "Customer",
     "The customer is signed in and the cart contains at least one item.",
     "1. The customer opens checkout; recipient details are pre-filled from the "
     "profile. 2. The customer chooses on-demand or a future date, selects a delivery "
     "window, and optionally adds a gift note. 3. On submission the system verifies the "
     "anti-CSRF token, recomputes every price from the database, creates the order and "
     "its items inside a transaction, records payment, marks the order paid and issues "
     "a unique reference. 4. The system notifies the customer and the administrator "
     "and clears the cart.",
     "A paid order with an auditable event trail exists."),
    ("Deliver Order", "Administrator",
     "A paid order exists.",
     "1. The administrator opens Orders and locates the order by search or status "
     "filter. 2. The administrator presses Deliver and confirms in the dialog. 3. The "
     "system marks the order delivered, records the event and notifies the customer. "
     "Alternate flow: the receiving customer presses “I received it” on their own "
     "order, with the administrator notified instead.",
     "The order is completed and the customer may leave feedback."),
    ("Rate and Review a Product", "Customer",
     "The customer is signed in.",
     "1. The customer opens a product page and selects a star rating with an optional "
     "comment. 2. The system stores one review per customer per product, replacing any "
     "earlier review by the same customer. 3. The administrator is notified; the "
     "review appears on the product page and, if highly rated, among the landing-page "
     "testimonials.",
     "A verified review is published and available for moderation."),
    ("Receive Notifications", "Customer / Administrator",
     "The user is signed in.",
     "1. The system creates notifications when orders are placed and delivered, when "
     "messages and reviews arrive, and as delivery reminders twenty-four hours and "
     "five hours before each window. 2. The user opens the notification list from the "
     "badge and marks single items or all items as read.",
     "The unread badge reflects the remaining unread notifications."),
]
for name, actor, pre, flow, post in UC:
    table(["Field", "Description"],
        [["Use case name", name], ["Actor(s)", actor], ["Precondition", pre],
         ["Main flow", flow], ["Postcondition", post]],
        cap=f"Use case description — {name}", widths=[1.35, 5.05])

doc.add_heading("3.6 Class Diagram", level=2)
p("Figure 4 presents the class model. User carries identity, role and the saved "
  "delivery details that pre-fill checkout. Product owns presentation and pricing, "
  "including the promotional discount from which its effective price is derived. Order "
  "aggregates OrderItems — each of which snapshots the product name and unit price at "
  "purchase time, so later catalogue changes cannot rewrite history — and exposes the "
  "two operations of the fulfilment workflow. Review associates a customer with a "
  "product under a uniqueness constraint. NotificationService is the cross-cutting "
  "collaborator through which every significant event reaches its audience, including "
  "the scheduled delivery reminders.")
diagram(dg.classes, "Class diagram of the principal entities")

doc.add_heading("3.7 Sequence Diagram — Checkout", level=2)
p("Figure 5 verifies the collaboration for the system’s most important scenario. Note "
  "two properties of the design that the diagram makes explicit. First, the browser’s "
  "cart contents are treated as a proposal only: the server recomputes every price from "
  "the database before anything is stored, so a manipulated client cannot alter what it "
  "pays. Second, order creation is transactional: the order, its items and its first "
  "event either all exist or none do.")
diagram(dg.sequence, "Sequence diagram — checkout and order creation")

doc.add_heading("3.8 Order Life Cycle", level=2)
p("Figure 6 presents the deliberately minimal state model that emerged from iteration "
  "with the owner. An order is paid the moment checkout completes and delivered through "
  "a single action by either party. Every transition is recorded in the order_events "
  "table, which doubles as the administrator’s audit trail.")
diagram(dg.orderflow, "Order life cycle state model")

doc.add_heading("3.9 Database Design", level=2)
p("The relational schema was designed in third normal form: every attribute depends on "
  "the key of its table, catalogue taxonomy is factored into its own tables, and all "
  "cross-entity references are enforced with foreign keys. Deletion behaviour is chosen "
  "per relationship — order items survive product deletion with their snapshot data "
  "(SET NULL), while notifications and reviews follow their owning user (CASCADE). "
  "Figure 7 shows the schema as captured from the phpMyAdmin Designer of the live "
  "peonify database.")
picture(DBSHOT, "Database schema diagram (phpMyAdmin Designer view of the live peonify database)")
p("The entities are specified below.")
ENTS = [
    ("users", "Customers and the administrator, distinguished by the role column.",
     [("id", "INT, PK, auto-increment", "Unique user identifier"),
      ("name / email", "VARCHAR; email UNIQUE", "Identity and sign-in credential"),
      ("password_hash", "VARCHAR(255)", "bcrypt hash; plaintext is never stored"),
      ("role", "ENUM('customer','admin')", "Access level"),
      ("avatar_url / phone", "VARCHAR", "Profile photograph and contact"),
      ("address / city", "VARCHAR", "Saved delivery location pre-filling checkout"),
      ("created_at", "TIMESTAMP", "Registration time")]),
    ("products", "The catalogue with pricing, discounting and imagery.",
     [("id / slug", "INT PK; VARCHAR UNIQUE", "Identifier and URL-safe name"),
      ("name / description", "VARCHAR / TEXT", "Presentation"),
      ("category / collection", "VARCHAR", "Taxonomy (managed in categories / collections)"),
      ("price_cents", "INT", "Price in cents — exact integer arithmetic"),
      ("discount_percent", "INT 0–90", "Promotional (flash-sale) discount"),
      ("image_url / in_stock", "VARCHAR / TINYINT", "Photograph and availability"),
      ("created_at", "TIMESTAMP", "Drives the “New” badge and newest-first sort")]),
    ("orders", "One row per purchase.",
     [("id / reference", "INT PK; VARCHAR UNIQUE", "Identifier and human-readable reference (PNY-XXXXXX)"),
      ("user_id", "INT, FK→users, SET NULL", "Purchasing customer"),
      ("customer_name / email / phone", "VARCHAR", "Recipient details"),
      ("address / delivery_date / delivery_window", "VARCHAR / DATE / VARCHAR", "Where and when to deliver"),
      ("order_type / gift_note", "VARCHAR / TEXT", "On-demand or scheduled; optional note"),
      ("total_cents / payment_ref", "INT / VARCHAR", "Server-computed total and payment record"),
      ("status", "ENUM paid | delivered (pending_payment reserved)", "Fulfilment state"),
      ("reminded_1d / reminded_5h", "TINYINT", "Reminder bookkeeping"),
      ("created_at", "TIMESTAMP", "Purchase time")]),
    ("order_items", "The lines of an order; snapshots survive catalogue changes.",
     [("id / order_id", "INT PK; FK→orders CASCADE", "Line and owning order"),
      ("product_id", "INT, FK→products, SET NULL", "Product, if catalogue-based"),
      ("name / quantity / unit_price_cents", "VARCHAR / INT / INT", "Snapshot at purchase time"),
      ("custom_config", "TEXT (JSON)", "Bouquet-builder configuration, when custom")]),
    ("order_events", "The audit trail of every status change.",
     [("id / order_id", "INT PK; FK→orders CASCADE", "Event and owning order"),
      ("status / note", "VARCHAR", "Transition and human-readable note"),
      ("created_at", "TIMESTAMP", "When the transition occurred")]),
    ("notifications", "In-application notifications for both roles.",
     [("id / user_id", "INT PK; FK→users CASCADE", "Notification and recipient"),
      ("title / body / link", "VARCHAR", "Content"),
      ("is_read", "TINYINT", "Read state; drives unread badges"),
      ("created_at", "TIMESTAMP", "Creation time")]),
    ("reviews", "Verified product feedback.",
     [("id", "INT PK", "Identifier"),
      ("user_id / product_id", "FKs, CASCADE; UNIQUE(user_id, product_id)", "One review per customer per product"),
      ("rating / comment", "TINYINT 1–5 / TEXT", "The feedback itself"),
      ("created_at", "TIMESTAMP", "Last submission time")]),
    ("messages", "Contact-form and support messages (administrator inbox).",
     [("id", "INT PK", "Identifier"),
      ("name / email / subject / body", "VARCHAR / TEXT", "Sender and content"),
      ("created_at", "TIMESTAMP", "Arrival time")]),
    ("categories & collections", "Administrator-managed catalogue taxonomy.",
     [("id / slug / name", "INT PK; VARCHAR UNIQUE; VARCHAR", "Identifier and labels"),
      ("description", "VARCHAR (collections only)", "Shown on the landing page")]),
    ("builder_options", "The bouquet builder’s selectable options.",
     [("id / step", "INT PK; ENUM size|focal|foliage|packaging", "Option and its step"),
      ("name / detail / price_cents", "VARCHAR / VARCHAR / INT", "Label, description and price contribution")]),
    ("settings", "Small key-value store for system bookkeeping.",
     [("k / v", "VARCHAR PK / VARCHAR", "Used to pace the reminder scheduler")]),
]
for ent, desc, cols in ENTS:
    doc.add_heading(f"Entity: {ent}", level=4)
    p(desc)
    table(["Attribute", "Type / Constraint", "Purpose"], cols,
          cap=f"Attributes of the {ent} entity", widths=[1.7, 2.2, 2.5])

doc.add_heading("3.10 System Architecture Design", level=2)
p("Figure 8 presents the three-tier architecture. The presentation tier runs entirely "
  "in the browser with no frameworks and no build step: semantic HTML5, a hand-written "
  "CSS3 theme, and vanilla JavaScript providing the cart, the bouquet preview, toasts, "
  "modal dialogs and confirmation dialogs, with Lucide supplying icons and Chart.js "
  "rendering the dashboard charts. The application tier consists of one PHP page "
  "controller per screen, sharing two include files: db.php, which owns the PDO "
  "connection and the idempotent migration and seeding logic, and functions.php, which "
  "provides authentication, CSRF protection, uploads, notifications and the reminder "
  "scheduler. The data tier is MySQL 8 with InnoDB tables and enforced foreign keys. "
  "The separation allows each tier to evolve independently: the storefront can be "
  "restyled without touching order logic, and the schema migrates itself without manual "
  "administration.")
diagram(dg.architecture, "Three-tier system architecture on the XAMPP platform")

doc.add_heading("3.11 Interface Design Principles", level=2)
p("The interface design pursued two goals that are usually in tension: a premium visual "
  "identity appropriate to a luxury product, and operational simplicity appropriate to "
  "non-technical users. The visual identity rests on a rose-and-ivory palette, a serif "
  "display face (Cormorant Garamond) paired with a clean sans-serif (Jost), authentic "
  "flower photography, and consistent iconography. Operational simplicity rests on "
  "plain-language labels, one task per screen, confirmation dialogs before destructive "
  "actions, toast feedback after every action, and pagination wherever content can "
  "grow. Chapter 4 presents the realised interfaces.")
pagebreak()
