# -*- coding: utf-8 -*-
"""Peonify diagrams as native, editable Word drawings (built on shapes.Draw)."""
from shapes import Draw

ROSE = ("FDF2F6", "B0316B")
BLUE = ("E8F0FC", "1A56B0")
GREEN = ("F2FBF4", "1E7E3E")
AMBER = ("FFF7E8", "B7791F")
RED = ("FDEEEC", "C0392B")

def existing_process():
    d = Draw(6.9, 2.3)
    boxes = [
        ("Post photos on\nsocial media", ROSE),
        ("Customer sends\na direct message", ROSE),
        ("Negotiate price\n& delivery in chat", AMBER),
        ("Manual payment\n(cash / transfer)", AMBER),
        ("Deliver from\nmemory", RED),
    ]
    probs = ["visibility fades\nin hours", "orders scattered\nin threads",
             "no fixed prices\nor records", "no receipts or\nreconciliation",
             "missed / forgotten\ndeliveries"]
    x = 0.05
    for i, (t, (f, l)) in enumerate(boxes):
        d.box(x, 0.55, 1.22, 0.75, t, fill=f, line=l, size=8.5, bold_first=False)
        d.label(x, 1.45, 1.22, 0.5, probs[i], size=7.5, color="8A3B3B")
        if i < 4:
            d.line(x + 1.22, 0.92, x + 1.42, 0.92)
        x += 1.42
    d.label(0.3, 2.0, 6.3, 0.28,
            "No permanent catalogue · no customer accounts · no reporting", size=8.5)
    return d

def usecase():
    d = Draw(6.9, 5.6)
    d.box(1.62, 0.15, 3.7, 5.3, "", fill="FAFAFA", line="8C8C8C", geom="rect")
    d.label(1.62, 0.2, 3.7, 0.25, "Peonify Web System", size=9, bold=True)
    d.actor(0.35, 0.55, "Guest")
    d.actor(0.35, 3.0, "Customer")
    d.actor(6.15, 1.9, "Administrator")
    left = ["Browse & search shop", "Build custom bouquet", "Register / Log in",
            "Checkout & pay", "Confirm delivery", "Rate & review product",
            "Manage profile", "Contact support", "Receive notifications"]
    for i, t in enumerate(left):
        y = 0.55 + i * 0.54
        fill, line = ROSE if i < 3 else BLUE
        d.ellipse(1.85, y, 1.62, 0.42, t, fill=fill, line=line)
    right = ["Manage products", "Manage catalog", "Set discounts (sales)",
             "Deliver orders", "View analytics", "Moderate feedback",
             "Answer support inbox", "Audit activity", "Manage profile"]
    for i, t in enumerate(right):
        y = 0.55 + i * 0.54
        d.ellipse(3.62, y, 1.62, 0.42, t, fill=GREEN[0], line=GREEN[1])
    for i in range(3):
        d.line(0.95, 1.05 + i * 0.1, 1.85, 0.78 + i * 0.54, "8C8C8C", 1.0, arrow=False)
    for i in range(3, 9):
        d.line(0.95, 3.5 + (i - 3) * 0.08, 1.85, 0.78 + i * 0.54, "8C8C8C", 1.0, arrow=False)
    for i in range(9):
        d.line(6.2, 2.35 + i * 0.05, 5.24, 0.78 + i * 0.54, "8C8C8C", 1.0, arrow=False)
    return d

def classes():
    d = Draw(6.9, 4.1)
    def cls(x, y, name, attrs, ops, colors):
        f, l = colors
        d.box(x, y, 2.1, 1.55, [name] + attrs + ["( ) " + o for o in ops],
              fill=f, line=l, size=7.6, geom="rect", bold_first=True)
    cls(0.10, 0.30, "User",
        ["id, name, email, role", "password_hash, avatar_url", "phone, address, city"],
        ["register / login", "updateProfile, changePassword"], ROSE)
    cls(2.40, 0.30, "Product",
        ["slug, name, description", "category, collection, image", "price_cents, discount, stock"],
        ["effectivePrice", "create / update / delete"], GREEN)
    cls(4.70, 0.30, "Order",
        ["reference, user_id, address", "delivery_date, window", "total_cents, status"],
        ["create (server pricing)", "deliver, notifyParties"], BLUE)
    cls(0.10, 2.30, "Review",
        ["user_id, product_id", "rating (1–5), comment"],
        ["upsert (one per pair)", "recent, moderate"], ("FFFFFF", "404040"))
    cls(2.40, 2.30, "OrderItem",
        ["order_id, product_id, name", "quantity, unit_price_cents", "custom_config (JSON)"],
        ["lineTotal"], ("FFFFFF", "404040"))
    cls(4.70, 2.30, "NotificationService",
        ["notifyUser, notifyAdmins", "reminders 24 h / 5 h"],
        ["markRead, markAllRead"], AMBER)
    d.line(2.20, 1.05, 2.40, 1.05, arrow=False)
    d.line(4.50, 1.05, 4.70, 1.05, arrow=False)
    d.line(5.75, 1.85, 5.75, 2.30)
    d.line(3.45, 1.85, 3.45, 2.30)
    d.line(1.15, 1.85, 1.15, 2.30)
    d.label(2.05, 0.78, 0.9, 0.2, "reviews", size=7)
    d.label(4.35, 0.78, 0.9, 0.2, "appears in", size=7)
    d.label(3.5, 2.0, 1.0, 0.2, "1..* items", size=7, align="l")
    d.label(5.8, 2.0, 1.05, 0.2, "notifies", size=7, align="l")
    d.label(1.2, 2.0, 1.0, 0.2, "writes 1..*", size=7, align="l")
    return d

def sequence():
    d = Draw(6.9, 4.9)
    parts = [("Customer", 0.30, ROSE), ("Browser (JS cart)", 1.95, ROSE),
             ("PHP Server (Apache)", 3.70, BLUE), ("MySQL", 5.55, GREEN)]
    centers = []
    for name, x, (f, l) in parts:
        d.box(x, 0.10, 1.25, 0.42, name, fill=f, line=l, size=8, bold_first=True, geom="rect")
        cx = x + 0.625
        centers.append(cx)
        d.line(cx, 0.52, cx, 4.35, "BFBFBF", 1.0, arrow=False, dash="dash")
    msgs = [
        (0, 1, "Open checkout (details pre-filled from profile)"),
        (0, 1, "Choose delivery date + time window; submit"),
        (1, 2, "POST checkout.php (CSRF token + cart JSON)"),
        (2, 3, "Recompute every price from the database"),
        (2, 3, "BEGIN · INSERT order (paid) + items · COMMIT"),
        (2, 3, "INSERT order event + notifications (both roles)"),
        (2, 1, "Redirect to account (unique reference PNY-XXXXXX)"),
        (1, 0, "Toast: “Order placed — follow it in your account”"),
    ]
    y = 0.95
    for frm, to, label in msgs:
        x1, x2 = centers[frm], centers[to]
        d.label(min(x1, x2), y - 0.26, abs(x2 - x1), 0.22, label, size=7.6)
        d.line(x1, y, x2, y)
        y += 0.42
    d.box(0.30, y - 0.05, 6.3, 0.55,
          "Later — delivery: the administrator presses Deliver (or the customer presses “I received it”)\n"
          "→ status delivered → event logged → the other party notified.",
          fill="F7F7F7", line="8C8C8C", size=7.8, geom="rect", bold_first=False, dash="dash")
    return d

def architecture():
    d = Draw(6.9, 4.6)
    d.box(0.15, 0.10, 6.6, 1.15,
          ["PRESENTATION TIER — Browser: HTML5 · CSS3 · Vanilla JavaScript",
           "Storefront pages · bouquet builder (live photo preview) · cart (localStorage) · checkout",
           "customer account · admin dashboard (sidebar, Chart.js) · Lucide icons · toasts & modals"],
          fill=ROSE[0], line=ROSE[1], size=8.3, geom="roundRect")
    d.line(3.45, 1.25, 3.45, 1.62)
    d.label(3.6, 1.28, 3.1, 0.3, "HTTP (Apache) · CSRF-protected POSTs ·\nHTTP-only session cookie", size=7.4, align="l")
    d.box(0.15, 1.65, 6.6, 1.25,
          ["APPLICATION TIER — PHP 8 on Apache (XAMPP)",
           "Page controllers (index · shop · product · builder · cart · checkout · account · admin/*)",
           "includes/db.php — PDO, auto-migration, seeding   ·   includes/functions.php — auth, CSRF,",
           "uploads, notifications, delivery reminders (24 h / 5 h)"],
          fill=BLUE[0], line=BLUE[1], size=8.3, geom="roundRect")
    d.line(3.45, 2.90, 3.45, 3.27)
    d.label(3.6, 2.94, 3.0, 0.28, "PDO — prepared statements only", size=7.4, align="l")
    d.box(0.15, 3.30, 6.6, 1.1,
          ["DATA TIER — MySQL 8 (InnoDB)",
           "users · products · categories · collections · builder_options · orders · order_items",
           "order_events · notifications · reviews · messages · settings — self-created and seeded on first run"],
          fill=GREEN[0], line=GREEN[1], size=8.3, geom="roundRect")
    return d

def orderflow():
    d = Draw(6.9, 1.9)
    d.box(0.25, 0.62, 0.16, 0.16, "", fill="222222", line="222222", geom="ellipse")
    d.line(0.41, 0.70, 1.0, 0.70)
    d.label(0.35, 0.36, 0.7, 0.22, "checkout", size=7.5)
    d.box(1.0, 0.35, 1.9, 0.7, "paid\npayment recorded · awaiting delivery",
          fill=BLUE[0], line=BLUE[1], size=8.5)
    d.line(2.9, 0.70, 4.15, 0.70)
    d.label(2.9, 0.30, 1.25, 0.4, "admin “Deliver” or customer\n“I received it”", size=7.2)
    d.box(4.15, 0.35, 1.7, 0.7, "delivered\norder complete", fill=GREEN[0], line=GREEN[1], size=8.5)
    d.line(5.85, 0.70, 6.35, 0.70)
    d.box(6.35, 0.60, 0.2, 0.2, "", fill=None, line="222222", geom="ellipse")
    d.box(6.40, 0.65, 0.1, 0.1, "", fill="222222", line="222222", geom="ellipse")
    d.label(0.6, 1.35, 5.7, 0.3,
            "Every transition is stored as a timestamped row in order_events — the audit trail. "
            "Reminders fire 24 h and 5 h before the window.", size=7.6)
    return d

def gantt():
    d = Draw(6.9, 3.3)
    months = ["Month 1", "Month 2", "Month 3", "Month 4"]
    x0, colw = 2.2, 1.15
    for i, m in enumerate(months):
        d.label(x0 + i * colw, 0.05, colw, 0.25, m, size=8, bold=True)
        if i:
            d.line(x0 + i * colw, 0.32, x0 + i * colw, 3.05, "D9D9D9", 0.75, arrow=False)
    rows = [
        ("Requirements & analysis", 0.00, 0.55, "B0316B"),
        ("Interface design", 0.45, 0.65, "B0316B"),
        ("Storefront & bouquet builder", 1.05, 1.10, "1A56B0"),
        ("Accounts, roles & dashboards", 1.70, 1.10, "1A56B0"),
        ("Checkout & order management", 2.50, 0.75, "B7791F"),
        ("Notifications & reminders", 2.95, 0.65, "B7791F"),
        ("Testing & refinement", 3.30, 0.75, "1E7E3E"),
        ("Documentation & handover", 3.75, 0.60, "1E7E3E"),
    ]
    y = 0.45
    for name, start, dur, color in rows:
        d.label(0.0, y, 2.1, 0.24, name, size=7.6, align="l", color="000000")
        d.box(x0 + start * colw, y + 0.02, dur * colw, 0.18, "", fill=color, line=color, geom="roundRect")
        y += 0.33
    d.line(x0, 0.32, x0, 3.05, "8C8C8C", 1.0, arrow=False)
    d.line(x0, 3.05, x0 + 4 * colw, 3.05, "8C8C8C", 1.0, arrow=False)
    return d
