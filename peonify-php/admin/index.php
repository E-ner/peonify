<?php
$pageTitle = 'Dashboard — Atelier Admin';
include __DIR__ . '/includes/layout_top.php';
$pdo = db();
require_permission('dashboard');

$isAdmin = is_admin();
$canReports = user_can('reports');
$canProducts = user_can('products');
$canFeedback = user_can('feedback');
$canInbox = user_can('inbox');
$canActivity = user_can('activity');

$roleLabel = $isAdmin ? 'Admin' : role_label($admin['role']);

$stats = [];

if ($isAdmin || $canReports) {
    $stats['revenue'] = (int)$pdo->query("SELECT COALESCE(SUM(total_cents),0) s FROM orders WHERE status <> 'pending_payment'")->fetch()['s'];
    $stats['customers'] = (int)$pdo->query("SELECT COUNT(*) c FROM users WHERE role = 'customer'")->fetch()['c'];
}

$stats['active'] = (int)$pdo->query("SELECT COUNT(*) c FROM orders WHERE status = 'paid'")->fetch()['c'];

if ($canProducts) {
    $stats['products'] = (int)$pdo->query('SELECT COUNT(*) c FROM products')->fetch()['c'];
}
if ($canFeedback) {
    $stats['reviews'] = (int)$pdo->query('SELECT COUNT(*) c FROM reviews')->fetch()['c'];
}
if ($canInbox) {
    $stats['messages'] = (int)$pdo->query('SELECT COUNT(*) c FROM messages')->fetch()['c'];
}

$revenueByDay = [];
$statusCounts = ['paid' => 0, 'delivered' => 0, 'pending_payment' => 0];
$top = [];
$recentActivity = [];

if ($isAdmin || $canReports) {
    $rows = $pdo->query("SELECT DATE(created_at) d, SUM(total_cents) s FROM orders
                         WHERE status <> 'pending_payment' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
                         GROUP BY DATE(created_at)")->fetchAll();
    $byDay = array_column($rows, 's', 'd');
    for ($i = 29; $i >= 0; $i--) {
        $d = date('Y-m-d', strtotime("-$i days"));
        $revenueByDay[$d] = (int)($byDay[$d] ?? 0);
    }
    foreach ($pdo->query('SELECT status, COUNT(*) c FROM orders GROUP BY status') as $r) $statusCounts[$r['status']] = (int)$r['c'];
}

if ($isAdmin || $canProducts) {
    $top = $pdo->query("SELECT oi.name, SUM(oi.quantity) sold, SUM(oi.quantity * oi.unit_price_cents) rev
                        FROM order_items oi JOIN orders o ON o.id = oi.order_id
                        WHERE o.status <> 'pending_payment'
                        GROUP BY oi.name ORDER BY sold DESC LIMIT 5")->fetchAll();
}

if ($isAdmin || $canActivity) {
    $recentActivity = $pdo->query('SELECT oe.id, oe.status, oe.note, oe.created_at, o.reference, o.customer_name
                                   FROM order_events oe JOIN orders o ON o.id = oe.order_id
                                   ORDER BY oe.created_at DESC LIMIT 8')->fetchAll();
}
?>
<h1><?= e($roleLabel) ?> Dashboard</h1>
<p class="muted">Your workspace at a glance.</p>

<div class="stats mb mt">
  <?php if (isset($stats['revenue'])): ?>
  <div class="stat"><span class="ico"><i data-lucide="wallet"></i></span><div><b><?= money_compact($stats['revenue']) ?></b><span>Revenue</span></div></div>
  <?php endif; ?>
  <div class="stat"><span class="ico"><i data-lucide="package"></i></span><div><b><?= $stats['active'] ?></b><span>Orders to deliver</span></div></div>
  <?php if (isset($stats['products'])): ?>
  <div class="stat"><span class="ico"><i data-lucide="flower-2"></i></span><div><b><?= $stats['products'] ?></b><span>Products</span></div></div>
  <?php endif; ?>
  <?php if (isset($stats['customers'])): ?>
  <div class="stat"><span class="ico"><i data-lucide="users"></i></span><div><b><?= $stats['customers'] ?></b><span>Customers</span></div></div>
  <?php endif; ?>
  <?php if (isset($stats['reviews'])): ?>
  <div class="stat"><span class="ico"><i data-lucide="message-square-heart"></i></span><div><b><?= $stats['reviews'] ?></b><span>Reviews</span></div></div>
  <?php endif; ?>
  <?php if (isset($stats['messages'])): ?>
  <div class="stat"><span class="ico"><i data-lucide="inbox"></i></span><div><b><?= $stats['messages'] ?></b><span>Messages</span></div></div>
  <?php endif; ?>
</div>

<?php if (($isAdmin || $canReports) && $revenueByDay): ?>
<div class="card card-pad mb">
  <h3>Revenue — last 30 days</h3>
  <p class="muted">Daily order revenue in USD.</p>
  <div style="height:260px"><canvas id="revenueChart"></canvas></div>
</div>

<div class="grid grid-2">
  <div class="card card-pad">
    <h3>Paid vs delivered</h3>
    <p class="muted">Orders waiting for delivery vs completed.</p>
    <div style="height:220px"><canvas id="statusChart"></canvas></div>
  </div>
  <?php if (($isAdmin || $canProducts) && $top): ?>
  <div class="card card-pad">
    <h3>Top sellers</h3>
    <p class="muted">Best performing arrangements.</p>
    <?php foreach ($top as $i => $t): ?>
      <div class="section-head" style="margin:10px 0;font-size:.9rem">
        <span><span class="step-num" style="background:var(--secondary);color:var(--fg)"><?= $i + 1 ?></span><?= e($t['name']) ?></span>
        <span class="muted"><?= (int)$t['sold'] ?> sold · <b style="color:var(--fg)"><?= money_compact((int)$t['rev']) ?></b></span>
      </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>
<?php endif; ?>

<?php if (($isAdmin || $canActivity) && $recentActivity): ?>
<div class="card card-pad mt">
  <h3>Recent activity</h3>
  <p class="muted">Latest order movements.</p>
  <div class="table-wrap"><table class="data">
    <tr><th>When</th><th>Order</th><th>Customer</th><th>Status</th><th class="hide-sm">Note</th></tr>
    <?php foreach ($recentActivity as $a): ?>
    <tr>
      <td style="white-space:nowrap" class="muted"><?= date('M j, g:i A', strtotime($a['created_at'])) ?></td>
      <td><b><?= e($a['reference']) ?></b></td>
      <td><?= e($a['customer_name']) ?></td>
      <td><span class="badge <?= $a['status'] === 'delivered' ? 'badge-ok' : 'badge-soft' ?>"><?= e(status_label($a['status'])) ?></span></td>
      <td class="hide-sm muted" style="font-size:.85rem"><?= e($a['note']) ?></td>
    </tr>
    <?php endforeach; ?>
  </table></div>
  <a class="btn btn-outline btn-sm mt" href="activity.php"><i data-lucide="activity"></i> View all activity</a>
</div>
<?php endif; ?>

<?php if (!$stats && !$recentActivity): ?>
<div class="card card-pad center mt" style="padding:40px">
  <p class="muted">Your dashboard will populate as activity comes in.</p>
</div>
<?php endif; ?>

<?php if (($isAdmin || $canReports) && $revenueByDay): ?>
<script>
document.addEventListener("DOMContentLoaded", function () {
  var rose = "#b0316b", roseSoft = "rgba(176, 49, 107, .15)";
  Chart.defaults.font.family = "Jost, sans-serif";
  Chart.defaults.color = "#8a7580";

  new Chart(document.getElementById("revenueChart"), {
    type: "line",
    data: {
      labels: <?= json_encode(array_map(fn($d) => date('M j', strtotime($d)), array_keys($revenueByDay))) ?>,
      datasets: [{
        label: "Revenue",
        data: <?= json_encode(array_map(fn($c) => round($c / 100, 2), array_values($revenueByDay))) ?>,
        borderColor: rose, backgroundColor: roseSoft, fill: true,
        tension: .35, pointRadius: 0, pointHitRadius: 12, borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: function (c) { return "$" + c.parsed.y.toFixed(2); } } } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { beginAtZero: true, ticks: { callback: function (v) { return "$" + v; } },
             grid: { color: "rgba(236, 217, 226, .6)" } }
      }
    }
  });

  new Chart(document.getElementById("statusChart"), {
    type: "bar",
    data: {
      labels: ["Paid — to deliver", "Delivered", "Awaiting payment"],
      datasets: [{
        data: [<?= (int)$statusCounts['paid'] ?>, <?= (int)$statusCounts['delivered'] ?>, <?= (int)$statusCounts['pending_payment'] ?>],
        backgroundColor: [rose, "#1e7e3e", "#d5b3c4"], borderRadius: 8, maxBarThickness: 60
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "rgba(236, 217, 226, .6)" } }
      }
    }
  });
});
</script>
<?php endif; ?>
<?php include __DIR__ . '/includes/layout_bottom.php'; ?>
