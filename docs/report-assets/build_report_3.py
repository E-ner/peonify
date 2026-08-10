# -*- coding: utf-8 -*- (concatenated after build_report_2.py)

# ╔══════════════════════════ CHAPTER 4 ══════════════════════════╗
doc.add_heading("CHAPTER 4", level=1)
doc.add_heading("SYSTEM IMPLEMENTATION AND TESTING", level=1)

doc.add_heading("4.1 Introduction", level=2)
p("This chapter presents the technical realisation of Peonify. It describes the "
  "development environment and the technologies employed with their justification, "
  "explains how each module of the design was implemented, details the security "
  "measures applied, presents the developed system through authentic screen captures of "
  "the running application, and reports the testing performed against the requirements "
  "of Chapter 2.")

doc.add_heading("4.2 Development Environment", level=2)
doc.add_heading("4.2.1 Hardware Requirements", level=3)
table(["Component", "Minimum", "Used during development"],
    [["Processor", "Dual-core 1.6 GHz", "Quad-core 2.4 GHz"],
     ["Memory", "4 GB RAM", "8 GB RAM"],
     ["Storage", "2 GB free (XAMPP + system + images)", "SSD storage"],
     ["Display", "1366 × 768", "1920 × 1080"]],
    cap="Hardware requirements", widths=[1.6, 2.4, 2.4])
doc.add_heading("4.2.2 Software Requirements", level=3)
table(["Software", "Version", "Role"],
    [["Windows", "10 or later (any XAMPP-capable OS)", "Host operating system"],
     ["XAMPP", "8.x", "Apache web server, PHP runtime and MySQL bundled together"],
     ["PHP", "8.1 or later", "Server-side language"],
     ["MySQL", "8.0", "Relational database"],
     ["Web browser", "Any modern browser", "Client runtime"],
     ["Visual Studio Code", "Latest", "Development editor"],
     ["phpMyAdmin", "Bundled with XAMPP", "Database administration and schema capture"]],
    cap="Software requirements", widths=[1.7, 2.0, 2.7])

doc.add_heading("4.3 Technologies Used and Their Justification", level=2)
table(["Technology", "Justification"],
    [["XAMPP platform", "Free, widely taught, and installable by a non-technical user. Deployment of the finished system is a folder copy into htdocs; there is no build step and no command line."],
     ["PHP 8", "Mature and ubiquitous on affordable hosting. Provides bcrypt password hashing, session management and PDO in the standard library — the three pillars of this system’s security."],
     ["MySQL 8 (InnoDB)", "Enforced foreign keys and transactions protect commercial data; phpMyAdmin gives the owner a familiar administration surface; prices are stored as integer cents to avoid floating-point error."],
     ["HTML5 / CSS3", "Semantic markup with a hand-written theme keeps the storefront fast and fully under the project’s control; no CSS framework is required."],
     ["Vanilla JavaScript", "Powers the cart, the live bouquet preview, toasts, modal dialogs, confirmation dialogs and form enhancements without any framework or build tooling, preserving the copy-folder deployment property."],
     ["Chart.js (CDN)", "Renders the administrator’s revenue and order-status charts as genuine interactive charts."],
     ["Lucide icons (CDN)", "Provides a consistent, professional icon set across the storefront and dashboard."],
     ["Wikimedia Commons imagery", "Openly licensed flower photography with documented attribution serves as production-quality placeholder imagery until the boutique substitutes its own photographs."]],
    cap="Technologies used and their justification", widths=[1.9, 4.5])

doc.add_heading("4.4 Implementation of the Main Modules", level=2)
doc.add_heading("4.4.1 Automatic Installation and Seeding", level=3)
p("The single most important implementation decision for this case study is that the "
  "system installs itself. On the first request, includes/db.php connects to MySQL, "
  "creates the peonify database if it is missing, creates all twelve tables, and seeds "
  "the administrator account, the catalogue taxonomy, ten demonstration products and "
  "the bouquet-builder options. Every step is idempotent, so the same code path serves "
  "both first installation and every subsequent request without harm.")
doc.add_heading("4.4.2 Storefront and Merchandising", level=3)
p("The landing page implements the merchandising surface designed in Chapter 3: a hero "
  "section with a three-dimensional parallax photograph stack that tilts toward the "
  "pointer; a flash-sale banner linking to discounted arrangements; best sellers "
  "computed from actual order lines; newest arrivals; collection tiles whose cover "
  "images are drawn from the first product of each collection; verified customer "
  "testimonials; and a four-step “how it works” explanation. The shop page composes "
  "search, category, collection, price-range and sale filters with sorting and "
  "pagination, all expressed as ordinary hyperlink and form parameters so the state is "
  "bookmarkable.")
doc.add_heading("4.4.3 Bouquet Builder", level=3)
p("The builder renders its options from the builder_options table in four steps. A "
  "vanilla-JavaScript preview composes circular crops of real flower photography into a "
  "bouquet dome as selections are made, while a running breakdown prices each step. "
  "The completed configuration travels with the cart line as JSON and is stored on the "
  "order item, so the administrator sees exactly what was designed.")
doc.add_heading("4.4.4 Accounts, Profiles and Sessions", level=3)
p("Registration and login use split-screen pages with password visibility toggles and "
  "registration-time password confirmation. Passwords are hashed with bcrypt at cost "
  "twelve; the session identifier is regenerated at login; and the session cookie is "
  "HTTP-only and SameSite. The profile page provides a click-to-upload photograph with "
  "live preview, contact details, and the saved delivery address and city that pre-fill "
  "checkout; password change requires the current password and a matching confirmation.")
doc.add_heading("4.4.5 Cart, Checkout and Payment Recording", level=3)
p("The cart lives in the browser’s localStorage, so it survives navigation and login. "
  "Checkout requires an account and captures recipient, delivery date, time window and "
  "an optional gift note. On submission the server verifies the anti-CSRF token, "
  "recomputes every price from the database — treating the browser’s figures as a "
  "proposal only — creates the order, its items and its first event inside a "
  "transaction, records payment, marks the order paid and issues a unique reference of "
  "the form PNY-XXXXXX. Both parties are notified immediately.")
doc.add_heading("4.4.6 Fulfilment, Notifications and Reminders", level=3)
p("The administrator’s Orders screen provides search, a status filter and pagination; "
  "each paid order carries a single Deliver action guarded by a confirmation dialog. "
  "Symmetrically, the customer’s account offers “I received it” on any paid order. "
  "Either action completes the order, appends an audit event and notifies the other "
  "party. Delivery reminders are generated by a lazy scheduler that runs on page loads "
  "at most once every ten minutes — an approach chosen deliberately because XAMPP "
  "installations have no reliable cron facility — and notify the customer twenty-four "
  "hours and five hours before the chosen window.")
doc.add_heading("4.4.7 Administration Dashboard", level=3)
p("The administrator works in a dedicated workspace with a sidebar of nine sections: "
  "Dashboard, Orders, Products, Catalog, Feedback, Support, Notifications, Activity and "
  "Profile, plus a one-click return to the storefront and sign-out. The dashboard "
  "charts thirty days of revenue and the paid-versus-delivered pipeline with Chart.js "
  "and lists top sellers; Products offers create, edit and delete through a modal form "
  "with a click-to-upload photograph square and a promotional discount field; Catalog "
  "manages categories and collections; Feedback and Support present moderation and the "
  "message inbox; Activity is the audit table of all order events.")

doc.add_heading("4.5 Security Implementation", level=2)
bullets([
    "Authentication: passwords hashed with bcrypt (cost 12); plaintext never stored or "
    "logged; session identifier regenerated at login; sessions carried in HTTP-only, "
    "SameSite cookies inaccessible to page scripts.",
    "Authorisation: every protected page verifies the session and the role; "
    "administrators are excluded from purchasing at both interface and server level; "
    "customers can act only on their own orders, notifications and profile.",
    "Request integrity: an anti-CSRF token is embedded in and verified on every form "
    "submission.",
    "Injection defence: all database access uses PDO prepared statements; no query is "
    "ever assembled from raw user input.",
    "Upload safety: uploads are restricted to image MIME types verified server-side, "
    "limited to five megabytes, and stored under randomised names.",
    "Commercial integrity: order totals are recomputed on the server from the database "
    "at checkout; client-side prices are never trusted.",
])

doc.add_heading("4.6 Presentation of the Developed System", level=2)
p("The figures that follow are authentic captures of the running system, taken from "
  "the deployed application without retouching.")

SHOTS_LIST = [
    ("home", "Landing page — hero with parallax photograph stack, trust points and entry to the shop and builder",
     "The landing page establishes the boutique’s identity in the first screen: the "
     "serif display type, the rose-and-ivory palette and authentic photography, with "
     "the two principal calls to action and the floating customer testimonial."),
    ("shop", "Shop page — category chips, filters, search, sorting and the paginated product grid",
     "All discovery criteria compose freely and are expressed in the address bar, so "
     "any filtered view can be bookmarked or shared. Discount and “New” badges are "
     "computed from the catalogue data."),
    ("product", "Product page — discounted pricing, add-to-cart and verified customer feedback",
     "The product page presents the effective price alongside the original when a "
     "promotion applies, and hosts the feedback section where verified customers rate "
     "and review the arrangement."),
    ("builder", "Bouquet builder — four steps with a live photographic preview and price breakdown",
     "Each selection updates the composed preview and the per-step breakdown; the "
     "completed design is added to the cart with its configuration attached."),
    ("cart", "Cart — quantity controls, custom-bouquet lines and the checkout call to action",
     "The cart persists in the browser and distinguishes catalogue products from "
     "custom bouquets; totals update instantly as quantities change."),
    ("login", "Login page — split-screen design with password visibility toggle",
     "Authentication pages pair the form with full-bleed photography; field icons and "
     "the visibility toggle reduce input errors."),
    ("register", "Registration page — with password confirmation",
     "Registration validates email format, minimum password length and the match "
     "between password and confirmation before an account is created."),
    ("checkout", "Checkout — recipient details, delivery scheduling and the order summary",
     "Recipient details arrive pre-filled from the profile; the customer chooses "
     "on-demand or a future date with a time window; the summary presents the exact "
     "server-verified total."),
    ("account", "Customer dashboard — status cards and paginated orders with status badges",
     "The customer sees at a glance how many orders are awaiting delivery and "
     "delivered, the total spent, and each order’s state, with details and delivery "
     "confirmation one click away."),
    ("account_profile", "Customer profile — click-to-upload photograph, saved delivery details and password change",
     "The saved address and city pre-fill every future checkout; password change "
     "requires the current password and a matching confirmation."),
    ("contact", "Contact page — the public form that feeds the administrator’s inbox",
     "Messages submitted here create administrator notifications and appear in the "
     "Support section of the dashboard."),
    ("admin_dashboard", "Administrator dashboard — headline statistics, thirty-day revenue chart and order pipeline",
     "The dashboard answers the owner’s daily questions in one screen: revenue "
     "movement, orders awaiting delivery, catalogue size and customer count, with top "
     "sellers ranked by units sold."),
    ("admin_orders", "Administrator orders — search, status filter and the single Deliver action",
     "Every order arrives already paid; the administrator’s only task is the "
     "confirmed Deliver action, after which the customer is notified automatically."),
    ("admin_products", "Administrator products — the modal product form with click-to-upload photograph",
     "Products are created and edited in a modal dialog; the photograph square "
     "previews the upload before saving, and the discount field powers the "
     "storefront’s flash-sale merchandising."),
    ("admin_catalog", "Administrator catalog — categories and collections management",
     "The taxonomy the customers filter by is fully under the owner’s control; new "
     "entries appear in the storefront immediately."),
    ("admin_activity", "Administrator activity — the audit table of all order events",
     "Every order transition, with its timestamp and note, is permanently visible — "
     "the accountability record the manual process never had."),
]
for name, cap, desc in SHOTS_LIST:
    screenshot(name, cap)
    p(desc)

doc.add_heading("4.7 System Testing", level=2)
doc.add_heading("4.7.1 Testing Approach", level=3)
p("Testing proceeded at three complementary levels throughout development. Unit-level "
  "checks validated individual behaviours — price computation with discounts, reference "
  "generation, reminder timing arithmetic. Integration testing exercised complete "
  "request cycles against a live MySQL instance, verifying that each form submission "
  "produced the correct database state, notifications and redirects. Finally, "
  "system-level acceptance testing walked every user journey end to end in the "
  "browser, on both desktop and mobile viewports, including the failure paths: wrong "
  "passwords, mismatched confirmations, tampered tokens, oversized uploads and "
  "attempts to act on another user’s data.")
doc.add_heading("4.7.2 Test Cases and Results", level=3)
table(["#", "Test case", "Expected result", "Result"],
    [["1", "Register with mismatched passwords", "Error message; account not created", "Pass"],
     ["2", "Register and sign in", "Session starts; dashboard greets the user by name", "Pass"],
     ["3", "Sign in with a wrong password", "Error message; no session created", "Pass"],
     ["4", "Guest attempts checkout", "Redirected to login; returned to checkout after signing in", "Pass"],
     ["5", "Administrator attempts to buy", "Add-to-cart refused; checkout blocks administrator accounts", "Pass"],
     ["6", "Checkout with catalogue and custom items", "Order created as paid; totals recomputed server-side; unique reference issued", "Pass"],
     ["7", "Cart price manipulation attempt", "Server total derived from the database, ignoring altered client prices", "Pass"],
     ["8", "Administrator delivers an order", "Confirmation dialog; status delivered; customer notified", "Pass"],
     ["9", "Customer confirms receipt", "Status delivered; administrator notified", "Pass"],
     ["10", "Customer acts on another customer’s order", "Action refused", "Pass"],
     ["11", "Delivery reminders", "Notifications generated 24 hours and 5 hours before the window", "Pass"],
     ["12", "Post, update and moderate feedback", "One review per customer per product; appears on product and landing pages; administrator can remove", "Pass"],
     ["13", "Contact form submission", "Message stored in the inbox; administrator notified", "Pass"],
     ["14", "CSRF token tampering", "Request rejected", "Pass"],
     ["15", "Oversized / non-image upload", "Upload rejected with an error message", "Pass"],
     ["16", "First-run installation", "Database, tables, administrator account and demonstration catalogue created automatically", "Pass"]],
    cap="Functional test cases and results", widths=[0.4, 2.1, 3.2, 0.6])
pagebreak()

# ╔══════════════════════════ CHAPTER 5 ══════════════════════════╗
doc.add_heading("CHAPTER 5", level=1)
doc.add_heading("CONCLUSION AND RECOMMENDATIONS", level=1)

doc.add_heading("5.1 Summary of the Work Done", level=2)
p("This project set out to replace the fragile, chat-based selling process of a small "
  "floral boutique with complete, professional commerce infrastructure. The existing "
  "manual process was studied and modelled; its problems were traced to the absence of "
  "durable records at every stage; and a system was designed with object-oriented "
  "techniques, implemented on the PHP/MySQL/XAMPP stack, and tested across every user "
  "journey. The delivered system comprises a merchandised storefront, an interactive "
  "bouquet builder, secure role-based accounts, a server-verified checkout with "
  "payment recording and unique order references, a single-action fulfilment workflow "
  "with notifications and delivery reminders, verified product feedback, and an "
  "administrator dashboard with genuine analytics.")

doc.add_heading("5.2 Achievement of Objectives", level=2)
table(["Specific objective", "Achievement"],
    [["Analyse and model the existing manual process", "Achieved — Chapter 2 presents the environment, the process model (Figure 1) and the derived problems."],
     ["Design a premium storefront with a bouquet builder", "Achieved — implemented with live photographic preview and full merchandising (Figures 9–12)."],
     ["Implement secure role-based accounts", "Achieved — bcrypt, regenerated sessions, HTTP-only cookies, CSRF protection, separated dashboards."],
     ["Implement checkout with server-side pricing and unique references", "Achieved — transactional order creation; manipulation attempts defeated in testing (Test 7)."],
     ["Implement the fulfilment workflow with notifications and reminders", "Achieved — single-action delivery by either party; reminders at 24 h and 5 h (Tests 8–11)."],
     ["Provide analytics and catalogue control", "Achieved — Chart.js dashboard, product CRUD with photographs and discounts, catalogue management (Figures 20–23)."],
     ["Test every user journey", "Achieved — sixteen documented test cases, all passing (Table 24)."]],
    cap="Achievement of the specific objectives", widths=[3.2, 3.2])

doc.add_heading("5.3 Challenges Encountered", level=2)
p("Three challenges shaped the final system. First, designing for a non-technical "
  "operator required repeatedly simplifying features that were technically satisfying "
  "but operationally heavy — most visibly the reduction of the fulfilment pipeline to "
  "a single transition. Second, the absence of a scheduling facility on XAMPP required "
  "an alternative design for delivery reminders, solved with a lazy scheduler paced "
  "through the database. Third, guaranteeing commercial integrity against a "
  "manipulable browser required moving every price computation to the server and "
  "treating the client cart strictly as a proposal.")

doc.add_heading("5.4 Recommendations", level=2)
bullets([
    "The boutique should replace the openly licensed placeholder photography with its "
    "own product photographs before commercial launch.",
    "The default administrator credentials and the application’s secret values should "
    "be changed immediately after installation.",
    "A TLS certificate should be configured when the system moves from local testing "
    "to public hosting.",
    "Regular database backups should be scheduled using phpMyAdmin’s export facility "
    "or mysqldump.",
])

doc.add_heading("5.5 Future Work", level=2)
bullets([
    "Integration of an online payment gateway (card and mobile money) at checkout.",
    "Delivery of the existing notifications additionally by email and SMS.",
    "Order cancellation and refund handling with the corresponding audit events.",
    "Inventory quantity tracking per product with low-stock alerts.",
    "A multi-shop extension of the same role model, allowing several boutiques to "
    "share one installation.",
])
pagebreak()

# ╔══════════════════════════ REFERENCES ══════════════════════════╗
doc.add_heading("REFERENCES", level=1)
p("All online sources were accessed in July 2026.", italic=True)
REFS = [
    "1-800-Flowers.com, Inc. (2026). Flowers, flower delivery, fresh flowers online. https://www.1800flowers.com/",
    "Apache Friends. (2026). XAMPP Apache + MariaDB + PHP + Perl. https://www.apachefriends.org/",
    "Bloom & Wild. (2026). Flower delivery — letterbox flowers and gifts. https://www.bloomandwild.com/",
    "BusinessDojo. (2025). Flower shop industry: Market statistics and trends. https://dojobusiness.com/blogs/news/flower-shop-industry-statistics",
    "Chart.js. (2026). Chart.js — simple yet flexible JavaScript charting (Documentation). https://www.chartjs.org/docs/",
    "Floward. (2026). Online flowers & gifts — same-day flower delivery. https://floward.com/",
    "Grand View Research. (2024). Flower delivery service market size & share report, 2025–2030. https://www.grandviewresearch.com/industry-analysis/flower-delivery-service-market-report",
    "Lucide. (2026). Lucide — beautiful & consistent icons (Documentation). https://lucide.dev/",
    "Mastercard Strive. (2024). Social commerce: How micro and small businesses sell on social platforms. https://strivecommunity.org/insights/market-participation/social-commerce",
    "MDN Web Docs. (2026). Using HTTP cookies — HttpOnly, SameSite and Secure attributes. Mozilla. https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies",
    "MySQL. (2026). MySQL 8.0 reference manual. Oracle Corporation. https://dev.mysql.com/doc/refman/8.0/en/",
    "OWASP Foundation. (2025). Cross-site request forgery prevention cheat sheet. https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
    "OWASP Foundation. (2025). Password storage cheat sheet. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
    "PHP Group. (2026). PHP 8 manual — PDO, sessions and password hashing. https://www.php.net/manual/en/",
    "PwC. (2024). Is your brand ready for the $3 trillion social commerce marketplace? https://www.pwc.com/us/en/services/consulting/business-transformation/library/social-commerce.html",
    "Sommerville, I. (2016). Software Engineering (10th ed.). Pearson Education.",
    "Tidio. (2024). 11 key social commerce statistics to know. https://www.tidio.com/blog/social-commerce-statistics/",
    "Wikimedia Foundation. (2026). Wikimedia Commons — reusing content outside Wikimedia. https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia",
]
for r in sorted(REFS, key=str.lower):
    par = doc.add_paragraph(r)
    par.paragraph_format.left_indent = Inches(0.4)
    par.paragraph_format.first_line_indent = Inches(-0.4)
    par.paragraph_format.space_after = Pt(6)
pagebreak()

# ╔══════════════════════════ APPENDICES ══════════════════════════╗
doc.add_heading("APPENDICES", level=1)
doc.add_heading("Appendix A: Installation Guide (Windows / XAMPP)", level=2)
numbered([
    "Install XAMPP from apachefriends.org and open the XAMPP Control Panel.",
    "Press Start next to Apache and next to MySQL.",
    "Copy the peonify-php folder into C:\\xampp\\htdocs\\ and rename it to peonify.",
    "Open http://localhost/peonify/ in a browser. On this first visit the system "
    "creates the database, all tables, the administrator account and the "
    "demonstration catalogue automatically.",
    "Sign in as the administrator at http://localhost/peonify/admin/ with "
    "admin@peonify.com / peonify-admin, and change the password from the Profile "
    "section immediately.",
])
doc.add_heading("Appendix B: Configuration Reference (config.php)", level=2)
table(["Constant", "Purpose", "Default"],
    [["DB_HOST / DB_PORT", "MySQL server location", "127.0.0.1 / 3306"],
     ["DB_NAME", "Database name (created automatically)", "peonify"],
     ["DB_USER / DB_PASS", "MySQL credentials (XAMPP defaults)", "root / (empty)"],
     ["ADMIN_EMAIL / ADMIN_PASSWORD", "Seeded administrator account", "admin@peonify.com / peonify-admin"]],
    cap="Configuration reference", widths=[2.0, 2.6, 1.8])
doc.add_heading("Appendix C: Representative Code Excerpts", level=2)
p("Password verification and session establishment (login.php):", italic=True)
p("if ($user && password_verify($_POST['password'], $user['password_hash'])) {\n"
  "    session_regenerate_id(true);\n"
  "    $_SESSION['uid'] = (int)$user['id'];\n"
  "}", align="left", size=10)
p("Server-side price recomputation at checkout (checkout.php):", italic=True)
p("$st = $pdo->prepare('SELECT * FROM products WHERE id = ? AND in_stock = 1');\n"
  "$st->execute([(int)$item['product_id']]);\n"
  "$unit = effective_price($st->fetch());   // client price is ignored",
  align="left", size=10)
p("Anti-CSRF verification applied to every form (functions.php):", italic=True)
p("function csrf_check(): void {\n"
  "    if (($_POST['csrf'] ?? '') !== ($_SESSION['csrf'] ?? null)) {\n"
  "        http_response_code(400); exit('Invalid request token.');\n"
  "    }\n"
  "}", align="left", size=10)
doc.add_heading("Appendix D: Image Attribution", level=2)
p("All storefront and builder photography is sourced from Wikimedia Commons under free "
  "licences; the complete per-file attribution list ships with the system at "
  "peonify-php/assets/images/CREDITS.md. The images are placeholders to be replaced "
  "with the boutique’s own photography before commercial launch.")

# ---- fill the lists of figures and tables -----------------------------------
LOF_PAR.text = ""
for f in FIGS:
    LOF_PAR.insert_paragraph_before(f, style="List Bullet")
LOT_PAR.text = ""
for t in TABS:
    LOT_PAR.insert_paragraph_before(t, style="List Bullet")

doc.save(OUT)
print("Saved:", OUT)
print("figures:", len(FIGS), "| tables:", len(TABS))
