<?php
$pageTitle = 'Roles — Atelier Admin';
include __DIR__ . '/includes/layout_top.php';
$pdo = db();
require_permission('roles');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        require_permission('roles:edit');
        $slug = strtolower(trim($_POST['slug'] ?? ''));
        $name = trim($_POST['name'] ?? '');
        $desc = trim($_POST['description'] ?? '');
        $perms = $_POST['permissions'] ?? [];
        if (!is_array($perms)) $perms = [$perms];
        $color = trim($_POST['color'] ?? '#6366f1');
        if ($slug && $name) {
            try {
                $pdo->prepare('INSERT INTO roles (slug,name,description,permissions,color) VALUES (?,?,?,?,?)')
                    ->execute([$slug, $name, $desc, json_encode(array_values(array_unique($perms))), $color]);
                flash('ok', 'Role created.');
            } catch (PDOException $e) {
                flash('error', 'Slug already exists or invalid.');
            }
        } else {
            flash('error', 'Slug and name are required.');
        }
        header('Location: roles.php'); exit;
    }

    if ($action === 'update') {
        require_permission('roles:edit');
        $id = (int)($_POST['id'] ?? 0);
        $st = $pdo->prepare('SELECT * FROM roles WHERE id = ?');
        $st->execute([$id]);
        $r = $st->fetch();
        if ($r && !$r['is_system']) {
            $name = trim($_POST['name'] ?? '');
            $desc = trim($_POST['description'] ?? '');
            $perms = $_POST['permissions'] ?? [];
            if (!is_array($perms)) $perms = [$perms];
            $color = trim($_POST['color'] ?? '#6366f1');
            if ($name) {
                $pdo->prepare('UPDATE roles SET name = ?, description = ?, permissions = ?, color = ? WHERE id = ?')
                    ->execute([$name, $desc, json_encode(array_values(array_unique($perms))), $color, $id]);
                flash('ok', 'Role updated.');
            }
        }
        header('Location: roles.php'); exit;
    }

    if ($action === 'delete') {
        require_permission('roles:delete');
        $id = (int)($_POST['id'] ?? 0);
        $st = $pdo->prepare('SELECT * FROM roles WHERE id = ?');
        $st->execute([$id]);
        $r = $st->fetch();
        if ($r && !$r['is_system']) {
            $pdo->prepare('UPDATE users SET role = ? WHERE role = ?')->execute(['customer', $r['slug']]);
            $pdo->prepare('DELETE FROM roles WHERE id = ?')->execute([$id]);
            flash('ok', 'Role deleted. Users moved to Customer.');
        }
        header('Location: roles.php'); exit;
    }
}

$roles = all_roles();
$editRole = null;
if (isset($_GET['edit'])) {
    $editRole = get_role($_GET['edit']);
}

$allPerms = [
    'dashboard' => 'Dashboard',
    'orders' => 'Orders',
    'orders:deliver' => 'Deliver Orders',
    'products' => 'Products',
    'catalog' => 'Catalog',
    'feedback' => 'Feedback',
    'inbox' => 'Support Inbox',
    'notifications' => 'Notifications',
    'activity' => 'Activity Log',
    'reports' => 'Reports',
    'users' => 'Users',
    'users:edit' => 'Edit Users',
    'users:delete' => 'Delete Users',
    'roles' => 'Roles',
    'roles:edit' => 'Edit Roles',
    'roles:delete' => 'Delete Roles',
    'settings' => 'Settings',
    'profile' => 'Own Profile',
];
?>
<h1>Roles</h1>
<p class="muted">Define access levels for your team. Permissions control what each role can see and do.</p>

<div class="mb">
  <div class="card card-pad">
    <h3><?= $editRole ? 'Edit Role' : 'Create Role' ?></h3>
    <form method="post" class="mt">
      <?= csrf_field() ?><input type="hidden" name="action" value="<?= $editRole ? 'update' : 'create' ?>">
      <?php if ($editRole): ?><input type="hidden" name="id" value="<?= (int)$editRole['id'] ?>"><?php endif; ?>
      <div class="form-grid">
        <div class="field"><label>Slug</label><input name="slug" required value="<?= e($editRole['slug'] ?? '') ?>" placeholder="e.g. manager" <?= $editRole ? 'readonly' : '' ?>></div>
        <div class="field"><label>Display Name</label><input name="name" required value="<?= e($editRole['name'] ?? '') ?>" placeholder="e.g. Manager"></div>
        <div class="field full"><label>Description</label><input name="description" value="<?= e($editRole['description'] ?? '') ?>" placeholder="Short description"></div>
        <div class="field"><label>Badge Color</label><input type="color" name="color" value="<?= e($editRole['color'] ?? '#6366f1') ?>" style="width:100%;height:40px"></div>
      </div>
      <div class="mt">
        <label><b>Permissions</b></label>
        <div class="form-grid mt" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
          <?php foreach ($allPerms as $k => $v): ?>
            <label class="field" style="display:flex;align-items:center;gap:8px;padding:6px 0">
              <input type="checkbox" name="permissions[]" value="<?= e($k) ?>" <?= $editRole && in_array($k, json_decode((string)$editRole['permissions'], true) ?: [], true) ? 'checked' : '' ?>>
              <?= e($v) ?>
            </label>
          <?php endforeach; ?>
        </div>
      </div>
      <div class="mt" style="display:flex;gap:10px">
        <button type="submit" class="btn btn-primary"><?= $editRole ? 'Update' : 'Create' ?> Role</button>
        <?php if ($editRole): ?><a href="roles.php" class="btn btn-outline">Cancel</a><?php endif; ?>
      </div>
    </form>
  </div>

  <div class="card card-pad mt">
    <h3>Existing Roles</h3>
    <div class="table-wrap mt"><table class="data">
      <tr><th>Name</th><th>Slug</th><th>Permissions</th><th>Color</th><th></th></tr>
      <?php foreach ($roles as $r): $perms = json_decode((string)$r['permissions'], true) ?: []; ?>
      <tr>
        <td><b><?= e($r['name']) ?></b><?php if ($r['is_system']): ?><br><span class="muted" style="font-size:.78rem">System</span><?php endif; ?></td>
        <td><code><?= e($r['slug']) ?></code></td>
        <td style="max-width:260px"><span class="muted" style="font-size:.78rem"><?= e(implode(', ', array_slice($perms, 0, 8))) ?><?= count($perms) > 8 ? ' +' . (count($perms) - 8) . ' more' : '' ?></span></td>
        <td><span class="badge" style="background:<?= e($r['color']) ?>20;color:<?= e($r['color']) ?>"><?= e($r['color']) ?></span></td>
        <td style="text-align:right;white-space:nowrap">
          <a href="?edit=<?= e($r['slug']) ?>" class="btn btn-outline btn-sm"><i data-lucide="pencil"></i></a>
          <?php if (!$r['is_system']): ?>
            <form method="post" data-confirm="Delete role &quot;<?= e($r['name']) ?>&quot;? Users will become Customers." style="display:inline">
              <?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
              <button class="btn btn-outline btn-sm" style="color:#ef4444"><i data-lucide="trash-2"></i></button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
      <?php endforeach; ?>
    </table></div>
  </div>
</div>
<?php include __DIR__ . '/includes/layout_bottom.php'; ?>
