<?php
$pageTitle = 'Users — Atelier Admin';
include __DIR__ . '/includes/layout_top.php';
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        require_permission('users:edit');
        $name = trim($_POST['name'] ?? '');
        $email = strtolower(trim($_POST['email'] ?? ''));
        $pw = $_POST['password'] ?? '';
        $role = trim($_POST['role'] ?? 'customer');
        if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            flash('error', 'Name and valid email are required.');
        } elseif (strlen($pw) < 8) {
            flash('error', 'Password must be at least 8 characters.');
        } else {
            try {
                $pdo->prepare('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)')
                    ->execute([$name, $email, password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]), $role]);
                flash('ok', 'User created.');
            } catch (PDOException $e) {
                flash('error', 'Email already exists.');
            }
        }
        header('Location: users.php'); exit;
    }

    if ($action === 'update') {
        require_permission('users:edit');
        $id = (int)($_POST['id'] ?? 0);
        $st = $pdo->prepare('SELECT * FROM users WHERE id = ?');
        $st->execute([$id]);
        $u = $st->fetch();
        if ($u) {
            $name = trim($_POST['name'] ?? '');
            $email = strtolower(trim($_POST['email'] ?? ''));
            $role = trim($_POST['role'] ?? 'customer');
            $pw = $_POST['password'] ?? '';
            if ($name && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $params = [$name, $email, $role, $id];
                $sql = 'UPDATE users SET name = ?, email = ?, role = ?';
                if (strlen($pw) >= 8) {
                    $sql .= ', password_hash = ?';
                    $params[] = password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]);
                }
                $sql .= ' WHERE id = ?';
                try {
                    $pdo->prepare($sql)->execute($params);
                    flash('ok', 'User updated.');
                } catch (PDOException $e) {
                    flash('error', 'Email already in use.');
                }
            } else {
                flash('error', 'Invalid input.');
            }
        }
        header('Location: users.php'); exit;
    }

    if ($action === 'delete') {
        require_permission('users:delete');
        $id = (int)($_POST['id'] ?? 0);
        if ($id !== (int)$admin['id']) {
            $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
            flash('ok', 'User deleted.');
        }
        header('Location: users.php'); exit;
    }
}

$q = trim($_GET['q'] ?? '');
$roleFilter = $_GET['role'] ?? '';
$sql = 'SELECT * FROM users WHERE 1=1';
$args = [];
if ($q) { $sql .= ' AND (name LIKE ? OR email LIKE ?)'; array_push($args, "%$q%", "%$q%"); }
if ($roleFilter && $roleFilter !== 'all') { $sql .= ' AND role = ?'; $args[] = $roleFilter; }
$sql .= ' ORDER BY created_at DESC';
$st = $pdo->prepare($sql);
$st->execute($args);
$users = $st->fetchAll();
[$pageUsers, $pg, $pgs, $total] = paginate($users, 10);
$roles = all_roles();

$editUser = null;
if (isset($_GET['edit'])) {
    $st = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $st->execute([(int)$_GET['edit']]);
    $editUser = $st->fetch();
}
?>
<h1>Users</h1>
<p class="muted">Manage your team and their access levels.</p>

<div class="mb">
  <div class="card card-pad">
    <h3><?= $editUser ? 'Edit User' : 'Create User' ?></h3>
    <form method="post" class="mt">
      <?= csrf_field() ?><input type="hidden" name="action" value="<?= $editUser ? 'update' : 'create' ?>">
      <?php if ($editUser): ?><input type="hidden" name="id" value="<?= (int)$editUser['id'] ?>"><?php endif; ?>
      <div class="form-grid">
        <div class="field"><label>Full Name</label><input name="name" required value="<?= e($editUser['name'] ?? '') ?>"></div>
        <div class="field"><label>Email</label><input type="email" name="email" required value="<?= e($editUser['email'] ?? '') ?>"></div>
        <div class="field">
          <label>Role</label>
          <select name="role">
            <?php foreach ($roles as $r): ?>
              <option value="<?= e($r['slug']) ?>" <?= ($editUser['role'] ?? 'customer') === $r['slug'] ? 'selected' : '' ?>><?= e($r['name']) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="field"><label><?= $editUser ? 'New Password (leave blank to keep)' : 'Password' ?></label><input type="password" name="password" <?= $editUser ? '' : 'required' ?> minlength="8"></div>
      </div>
      <button type="submit" class="btn btn-primary mt"><?= $editUser ? 'Update' : 'Create' ?> User</button>
      <?php if ($editUser): ?><a href="users.php" class="btn btn-outline mt">Cancel</a><?php endif; ?>
    </form>
  </div>

  <div class="card card-pad mt">
    <h3>All Users</h3>
    <form class="filter-bar mt" method="get">
      <input type="search" name="q" value="<?= e($q) ?>" placeholder="Search name or email…">
      <select name="role">
        <option value="all">All roles</option>
        <?php foreach ($roles as $r): ?>
          <option value="<?= e($r['slug']) ?>" <?= $roleFilter === $r['slug'] ? 'selected' : '' ?>><?= e($r['name']) ?></option>
        <?php endforeach; ?>
      </select>
      <button class="btn btn-primary btn-sm">Apply</button>
    </form>
    <div class="table-wrap mt"><table class="data">
      <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
      <?php foreach ($pageUsers as $u): ?>
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge badge-soft" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-size:.75rem;font-weight:600"><?= e(strtoupper(substr($u['name'],0,1))) ?></span>
            <?= e($u['name']) ?>
          </div>
        </td>
        <td><?= e($u['email']) ?></td>
        <td><?= role_badge($u['role']) ?></td>
        <td class="hide-sm"><?= date('M j, Y', strtotime($u['created_at'])) ?></td>
        <td style="text-align:right;white-space:nowrap">
          <a href="?edit=<?= (int)$u['id'] ?>" class="btn btn-outline btn-sm"><i data-lucide="pencil"></i></a>
          <?php if ((int)$u['id'] !== (int)$admin['id']): ?>
            <form method="post" data-confirm="Remove user &quot;<?= e($u['name']) ?>&quot;?" style="display:inline">
              <?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
              <button class="btn btn-outline btn-sm" style="color:#ef4444"><i data-lucide="trash-2"></i></button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
      <?php endforeach; ?>
    </table></div>
    <?= pager_links($pg, $pgs, ['q' => $q, 'role' => $roleFilter]) ?>
  </div>
</div>
<?php include __DIR__ . '/includes/layout_bottom.php'; ?>
