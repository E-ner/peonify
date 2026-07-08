<?php
declare(strict_types=1);

require_once __DIR__ . '/../APIs/database.php';

class ProductModel
{
    public function __construct(private readonly Database $db)
    {
    }

    public function all(): array
    {
        $pdo = $this->db->getConnection();
        return $pdo->query("SELECT * FROM products ORDER BY created_at DESC, id DESC")->fetchAll();
    }

    public function oneBySlug(string $slug): ?array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare(
            "INSERT INTO products (slug,name,description,category,collection,price_cents,image_url,discount_percent,in_stock)
             VALUES (?,?,?,?,?,?,?,?,?)"
        );
        $stmt->execute([
            $data['slug'],
            $data['name'],
            $data['description'],
            $data['category'],
            $data['collection'],
            (int) $data['price_cents'],
            $data['image_url'] ?? '',
            (int) ($data['discount_percent'] ?? 0),
            !empty($data['in_stock']) ? 1 : 0,
        ]);
        $id = (int) $pdo->lastInsertId();
        return $pdo->query("SELECT * FROM products WHERE id = {$id}")->fetch();
    }

    public function update(int $id, array $data): ?array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare(
            "UPDATE products
             SET slug = ?, name = ?, description = ?, category = ?, collection = ?, price_cents = ?, image_url = ?, discount_percent = ?, in_stock = ?
             WHERE id = ?"
        );
        $stmt->execute([
            $data['slug'],
            $data['name'],
            $data['description'],
            $data['category'],
            $data['collection'],
            (int) $data['price_cents'],
            $data['image_url'] ?? '',
            (int) ($data['discount_percent'] ?? 0),
            !empty($data['in_stock']) ? 1 : 0,
            $id,
        ]);
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function delete(int $id): bool
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function topProducts(): array
    {
        $pdo = $this->db->getConnection();
        $sql = "SELECT p.name, COALESCE(SUM(oi.quantity), 0) AS sold
                FROM products p
                LEFT JOIN order_items oi ON oi.name = p.name
                GROUP BY p.id
                ORDER BY sold DESC
                LIMIT 5";
        return $pdo->query($sql)->fetchAll();
    }
}
