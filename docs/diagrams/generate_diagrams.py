#!/usr/bin/env python3
"""Generate Peonify Conceptual Framework and Use Case diagrams (PNG + PDF)."""
from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyArrowPatch, FancyBboxPatch, Polygon
from matplotlib.backends.backend_pdf import PdfPages

OUT = Path(__file__).resolve().parent
TITLE_COLOR = "#1a1a2e"
ACCENT = "#b0316b"
BLUE = "#1a56b0"
GREEN = "#1e7e3e"
AMBER = "#b7791f"
GRAY = "#666666"
LIGHT = "#f7f7fb"


def save(fig, name: str) -> None:
    png = OUT / f"{name}.png"
    pdf = OUT / f"{name}.pdf"
    fig.savefig(png, dpi=200, bbox_inches="tight", facecolor="white")
    fig.savefig(pdf, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"Wrote {png.name}, {pdf.name}")


def box(ax, x, y, w, h, text, fc="#ffffff", ec="#333333", fontsize=10, bold=False):
    patch = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle="round,pad=0.02,rounding_size=0.08",
        linewidth=1.4,
        edgecolor=ec,
        facecolor=fc,
    )
    ax.add_patch(patch)
    weight = "bold" if bold else "normal"
    ax.text(
        x + w / 2,
        y + h / 2,
        text,
        ha="center",
        va="center",
        fontsize=fontsize,
        color=TITLE_COLOR,
        weight=weight,
        wrap=True,
    )
    return patch


def arrow(ax, x1, y1, x2, y2, color=GRAY, style="-|>", lw=1.5):
    ax.add_patch(
        FancyArrowPatch(
            (x1, y1),
            (x2, y2),
            arrowstyle=style,
            mutation_scale=12,
            linewidth=lw,
            color=color,
            shrinkA=2,
            shrinkB=2,
        )
    )


def actor(ax, x, y, label, color=AMBER):
    head = Ellipse((x, y + 0.55), 0.35, 0.35, facecolor=color, edgecolor="#333", linewidth=1.2)
    body = Polygon(
        [(x - 0.28, y + 0.35), (x + 0.28, y + 0.35), (x + 0.42, y - 0.05), (x - 0.42, y - 0.05)],
        closed=True,
        facecolor=color,
        edgecolor="#333",
        linewidth=1.2,
    )
    ax.add_patch(head)
    ax.add_patch(body)
    ax.text(x, y - 0.35, label, ha="center", va="top", fontsize=11, weight="bold", color=TITLE_COLOR)


def usecase(ax, x, y, w, h, label, fc="#e8f0fc"):
    ell = Ellipse((x, y), w, h, facecolor=fc, edgecolor=BLUE, linewidth=1.2)
    ax.add_patch(ell)
    ax.text(x, y, label, ha="center", va="center", fontsize=8.5, color=TITLE_COLOR, wrap=True)
    return ell


def link(ax, ax_x, ax_y, uc_x, uc_y, uc_w, uc_h):
    dx = uc_x - ax_x
    dy = uc_y - ax_y
    dist = max((dx**2 + dy**2) ** 0.5, 0.001)
    sx = ax_x + 0.35 * dx / dist
    sy = ax_y + 0.35 * dy / dist
    ex = uc_x - (uc_w / 2) * dx / dist
    ey = uc_y - (uc_h / 2) * dy / dist
    ax.plot([sx, ex], [sy, ey], color="#555", linewidth=1.0)


def conceptual_framework():
    fig, ax = plt.subplots(figsize=(14, 9))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis("off")
    ax.set_title(
        "Peonify — Conceptual Framework",
        fontsize=18,
        weight="bold",
        color=TITLE_COLOR,
        pad=18,
    )

    # Inputs
    ax.text(1.2, 8.2, "INPUTS", fontsize=13, weight="bold", color=ACCENT)
    inputs = [
        "Customer needs & preferences",
        "Product catalogue (flowers, prices, images)",
        "Delivery address, date & time window",
        "Payment information",
        "Admin catalog & pricing data",
        "Contact & support messages",
    ]
    for i, t in enumerate(inputs):
        box(ax, 0.3, 6.8 - i * 0.95, 3.4, 0.75, t, fc="#fdf2f6", ec=ACCENT, fontsize=9)

    # Core process
    ax.text(6.2, 8.2, "THROUGHPUT / PROCESS", fontsize=13, weight="bold", color=BLUE)
    box(ax, 4.8, 7.0, 4.4, 0.85, "Peonify Floral E-Commerce Platform", fc=BLUE, ec=BLUE, fontsize=12, bold=True)
    ax.text(7.0, 6.85, "(React + Node.js + PostgreSQL)", ha="center", fontsize=8.5, color="white")

    processes = [
        ("Browse & search shop", 6.55),
        ("Bouquet builder", 5.45),
        ("Cart & checkout", 4.35),
        ("Paystack payment", 3.25),
        ("Order tracking & delivery", 2.15),
        ("Notifications & reminders", 1.05),
        ("Admin dashboard & analytics", 0.0),
    ]
    for label, y in processes:
        box(ax, 5.0, y, 4.0, 0.72, label, fc="#e8f0fc", ec=BLUE, fontsize=9.5)

    # Outputs
    ax.text(11.0, 8.2, "OUTPUTS", fontsize=13, weight="bold", color=GREEN)
    outputs = [
        "Completed & delivered orders",
        "Revenue & sales analytics",
        "Customer satisfaction (reviews)",
        "In-app notifications",
        "Audit trail (order events)",
        "Updated product catalogue",
    ]
    for i, t in enumerate(outputs):
        box(ax, 10.0, 6.8 - i * 0.95, 3.4, 0.75, t, fc="#f2fbf4", ec=GREEN, fontsize=9)

    # Arrows input -> process
    for i in range(6):
        y = 7.15 - i * 0.95
        arrow(ax, 3.75, y, 4.95, 6.4 - i * 0.35, color=ACCENT)

    # Arrows process -> output
    for i in range(6):
        y = 7.15 - i * 0.95
        arrow(ax, 9.05, 6.4 - i * 0.35, 9.95, y, color=GREEN)

    # Feedback loop
    box(ax, 4.5, -0.55, 5.0, 0.65, "FEEDBACK: Reviews · Contact inbox · Order events · Admin reports", fc="#fff7e8", ec=AMBER, fontsize=9)
    arrow(ax, 12.0, 1.4, 9.5, 0.05, color=AMBER, style="<|-")
    arrow(ax, 4.5, 0.05, 1.8, 1.4, color=AMBER, style="<|-")
    ax.text(7.0, -0.95, "Feedback informs catalogue updates, pricing, and service improvements", ha="center", fontsize=9, color=GRAY)

    save(fig, "conceptual-framework")


def use_case_main():
    fig, ax = plt.subplots(figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_title("Peonify — Main Use Case Diagram", fontsize=18, weight="bold", color=TITLE_COLOR, pad=16)

    # System boundary
    boundary = FancyBboxPatch(
        (3.2, 0.6),
        9.6,
        8.5,
        boxstyle="round,pad=0.02,rounding_size=0.15",
        linewidth=2,
        edgecolor=BLUE,
        facecolor=LIGHT,
        linestyle="--",
    )
    ax.add_patch(boundary)
    ax.text(8.0, 8.85, "Peonify Floral E-Commerce Platform", ha="center", fontsize=12, weight="bold", color=BLUE)

    # Actors
    actor(ax, 1.4, 7.2, "Guest")
    actor(ax, 1.4, 4.0, "Customer")
    actor(ax, 14.6, 5.5, "Admin")
    actor(ax, 14.6, 1.5, "Paystack\n(external)", color="#d4e8ff")

    # Use cases — left column (storefront)
    left_cases = [
        (4.2, 7.6, "Browse catalog"),
        (4.2, 6.7, "View static pages"),
        (4.2, 5.8, "Register account"),
        (4.2, 4.9, "Login / Logout"),
        (4.2, 4.0, "Build custom bouquet"),
        (4.2, 3.1, "Manage cart"),
        (4.2, 2.2, "Checkout & schedule delivery"),
        (4.2, 1.3, "Contact support"),
    ]
    # middle column
    mid_cases = [
        (7.0, 7.6, "View product details"),
        (7.0, 6.7, "Read reviews"),
        (7.0, 5.8, "Make payment"),
        (7.0, 4.9, "View order history"),
        (7.0, 4.0, "Receive notifications"),
        (7.0, 3.1, "Write product review"),
        (7.0, 2.2, "Manage profile"),
        (7.0, 1.3, "Confirm delivery"),
    ]
    # right column (admin)
    right_cases = [
        (9.8, 7.6, "View dashboard"),
        (9.8, 6.7, "Manage products"),
        (9.8, 5.8, "Manage categories\n& collections"),
        (9.8, 4.9, "Manage orders"),
        (9.8, 4.0, "View analytics"),
        (9.8, 3.1, "Moderate feedback"),
        (9.8, 2.2, "Respond to messages"),
        (9.8, 1.3, "View activity log"),
    ]

    ucs = []
    for x, y, label in left_cases + mid_cases + right_cases:
        ucs.append((x, y, usecase(ax, x, y, 2.1, 0.55, label)))

    guest_labels = {"Browse catalog", "View static pages", "Register account", "Contact support"}
    customer_labels = {
        "Browse catalog", "View static pages", "Login / Logout", "Build custom bouquet",
        "Manage cart", "Checkout & schedule delivery", "Contact support", "View product details",
        "Read reviews", "Make payment", "View order history", "Receive notifications",
        "Write product review", "Manage profile", "Confirm delivery",
    }
    all_cases = left_cases + mid_cases + right_cases
    for x, y, label in all_cases:
        if label in guest_labels:
            link(ax, 1.4, 7.55, x, y, 2.1, 0.55)
        if label in customer_labels:
            link(ax, 1.4, 4.35, x, y, 2.1, 0.55)
        if label in {
            "View dashboard", "Manage products", "Manage categories\n& collections",
            "Manage orders", "View analytics", "Moderate feedback", "Respond to messages",
            "View activity log",
        }:
            link(ax, 14.6, 5.85, x, y, 2.1, 0.55)

    # Paystack link to payment
    link(ax, 14.6, 1.85, 7.0, 5.8, 2.1, 0.55)

    # Include / extend notes
    ax.text(5.5, 0.85, "<<include>> Checkout includes payment & delivery details", fontsize=8.5, color=GRAY)
    ax.text(5.5, 0.55, "<<extend>> Payment triggers customer notification", fontsize=8.5, color=GRAY)

    save(fig, "use-case-diagram-main")


def use_case_customer():
    fig, ax = plt.subplots(figsize=(15, 11))
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 11)
    ax.axis("off")
    ax.set_title("Peonify — Customer Use Case Diagram", fontsize=18, weight="bold", color=TITLE_COLOR, pad=16)

    boundary = FancyBboxPatch(
        (2.8, 0.5),
        9.8,
        9.6,
        boxstyle="round,pad=0.02,rounding_size=0.15",
        linewidth=2,
        edgecolor=GREEN,
        facecolor=LIGHT,
        linestyle="--",
    )
    ax.add_patch(boundary)
    ax.text(7.7, 9.85, "Storefront (Customer-Facing)", ha="center", fontsize=12, weight="bold", color=GREEN)

    actor(ax, 1.0, 8.0, "Guest")
    actor(ax, 1.0, 3.5, "Customer")

    cases = [
        (4.0, 8.8, "Browse products"),
        (4.0, 8.0, "Filter by category"),
        (4.0, 7.2, "View product details"),
        (4.0, 6.4, "Read reviews"),
        (4.0, 5.6, "Register account"),
        (4.0, 4.8, "Build custom bouquet"),
        (4.0, 4.0, "Add to cart"),
        (4.0, 3.2, "Proceed to checkout"),
        (4.0, 2.4, "Process payment"),
        (4.0, 1.6, "Contact support"),
        (7.5, 8.8, "Search products"),
        (7.5, 8.0, "Login / Logout"),
        (7.5, 7.2, "Update cart items"),
        (7.5, 6.4, "Schedule delivery"),
        (7.5, 5.6, "Add gift note"),
        (7.5, 4.8, "View order history"),
        (7.5, 4.0, "Track delivery status"),
        (7.5, 3.2, "Write product review"),
        (7.5, 2.4, "View notifications"),
        (7.5, 1.6, "Manage profile"),
        (11.0, 8.8, "Accept cookie consent"),
        (11.0, 8.0, "View About / Terms"),
        (11.0, 7.2, "Change password"),
        (11.0, 6.4, "Update avatar"),
        (11.0, 5.6, "Confirm delivery"),
        (11.0, 4.8, "Mark notifications read"),
        (11.0, 4.0, "Save delivery address"),
        (11.0, 3.2, "View payment confirmation"),
        (11.0, 2.4, "Rate product (1–5 stars)"),
        (11.0, 1.6, "Remove from cart"),
    ]

    for x, y, label in cases:
        usecase(ax, x, y, 2.3, 0.52, label, fc="#e8f5e9")

    guest_idxs = {0, 1, 2, 3, 4, 9, 20, 21}
    for i, (x, y, _) in enumerate(cases):
        if i in guest_idxs:
            link(ax, 1.0, 8.35, x, y, 2.3, 0.52)
        link(ax, 1.0, 3.85, x, y, 2.3, 0.52)

    save(fig, "use-case-diagram-customer")


def use_case_admin():
    fig, ax = plt.subplots(figsize=(15, 11))
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 11)
    ax.axis("off")
    ax.set_title("Peonify — Admin Use Case Diagram", fontsize=18, weight="bold", color=TITLE_COLOR, pad=16)

    boundary = FancyBboxPatch(
        (2.5, 0.5),
        10.2,
        9.6,
        boxstyle="round,pad=0.02,rounding_size=0.15",
        linewidth=2,
        edgecolor=AMBER,
        facecolor=LIGHT,
        linestyle="--",
    )
    ax.add_patch(boundary)
    ax.text(7.6, 9.85, "Admin Workspace", ha="center", fontsize=12, weight="bold", color=AMBER)

    actor(ax, 1.0, 5.5, "Admin")
    actor(ax, 14.0, 2.0, "System", color="#e0e0e0")

    cases = [
        (4.0, 8.8, "View dashboard"),
        (4.0, 8.0, "View revenue overview"),
        (4.0, 7.2, "View paid vs delivered"),
        (4.0, 6.4, "View top sellers"),
        (4.0, 5.6, "Manage products"),
        (4.0, 4.8, "Upload product image"),
        (4.0, 4.0, "Set discounts & stock"),
        (4.0, 3.2, "Manage categories"),
        (4.0, 2.4, "Manage collections"),
        (4.0, 1.6, "Manage orders"),
        (7.5, 8.8, "Search / filter orders"),
        (7.5, 8.0, "Mark order delivered"),
        (7.5, 7.2, "View order details"),
        (7.5, 6.4, "View activity log"),
        (7.5, 5.6, "View customer reviews"),
        (7.5, 4.8, "Delete inappropriate review"),
        (7.5, 4.0, "View contact messages"),
        (7.5, 3.2, "Respond to messages"),
        (7.5, 2.4, "View admin notifications"),
        (7.5, 1.6, "Manage admin profile"),
        (11.0, 8.8, "Create / edit product"),
        (11.0, 8.0, "Delete product"),
        (11.0, 7.2, "Create / delete category"),
        (11.0, 6.4, "Create / delete collection"),
        (11.0, 5.6, "Login / Logout"),
        (11.0, 4.8, "Receive new order alerts"),
        (11.0, 4.0, "Receive message alerts"),
        (11.0, 3.2, "Receive review alerts"),
        (11.0, 2.4, "Delivery reminders (24h / 5h)"),
        (11.0, 1.6, "Change admin password"),
    ]

    for x, y, label in cases:
        usecase(ax, x, y, 2.3, 0.52, label, fc="#fff3e0")

    for x, y, _ in cases:
        link(ax, 1.0, 5.85, x, y, 2.3, 0.52)

    system_cases = cases[25:29]
    for x, y, _ in system_cases:
        link(ax, 14.0, 2.35, x, y, 2.3, 0.52)

    save(fig, "use-case-diagram-admin")


def combined_pdf():
    paths = [
        OUT / "conceptual-framework.png",
        OUT / "use-case-diagram-main.png",
        OUT / "use-case-diagram-customer.png",
        OUT / "use-case-diagram-admin.png",
    ]
    combined = OUT / "peonify-diagrams-combined.pdf"
    with PdfPages(combined) as pdf:
        for p in paths:
            img = plt.imread(p)
            fig, ax = plt.subplots(figsize=(11.69, 8.27))  # A4 landscape
            ax.imshow(img)
            ax.axis("off")
            pdf.savefig(fig, bbox_inches="tight", facecolor="white")
            plt.close(fig)
    print(f"Wrote {combined.name}")


def main():
    conceptual_framework()
    use_case_main()
    use_case_customer()
    use_case_admin()
    combined_pdf()


if __name__ == "__main__":
    main()
