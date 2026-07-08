<?php
declare(strict_types=1);

require_once __DIR__ . '/../APIs/database.php';

class OrderModel
{
    public function __construct(private readonly Database $db)
    {
    }

    public function revenueByDay(): array
    {
        $pdo = $this->db->getConnection();
        $sql = "SELECT DATE(created_at) AS day, COALESCE(SUM(total_cents), 0) AS revenue_cents
                FROM orders
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY day ASC";
        return $pdo->query($sql)->fetchAll();
    }

    public function statusCounts(): array
    {
        $pdo = $this->db->getConnection();
        return $pdo->query("SELECT status, COUNT(*) AS count FROM orders GROUP BY status")->fetchAll();
    }

    public function createOrder(array $payload, int $userId): array
    {
        $pdo = $this->db->getConnection();
        $pdo->beginTransaction();
        try {
            $reference = 'PNY-' . strtoupper(bin2hex(random_bytes(3)));
            $stmt = $pdo->prepare(
                "INSERT INTO orders (
                    reference, customer_name, email, user_id, total_cents, status,
                    phone, address, delivery_date, delivery_window, order_type, gift_note, payment_ref
                 ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
            );
            $stmt->execute([
                $reference,
                $payload['customer_name'],
                $payload['email'],
                $userId,
                (int) $payload['total_cents'],
                (string) ($payload['status'] ?? 'paid'),
                (string) ($payload['phone'] ?? ''),
                (string) ($payload['address'] ?? ''),
                ($payload['delivery_date'] ?? null) ?: null,
                (string) ($payload['delivery_window'] ?? ''),
                (string) ($payload['order_type'] ?? 'on_demand'),
                (string) ($payload['gift_note'] ?? ''),
                (string) ($payload['payment_ref'] ?? ('py_mock_' . time() . '_' . bin2hex(random_bytes(3)))),
            ]);
            $orderId = (int) $pdo->lastInsertId();

            $itemStmt = $pdo->prepare(
                "INSERT INTO order_items (order_id, product_id, name, quantity, unit_price_cents)
                 VALUES (?,?,?,?,?)"
            );
            foreach (($payload['items'] ?? []) as $it) {
                $itemStmt->execute([
                    $orderId,
                    isset($it['product_id']) ? (int) $it['product_id'] : null,
                    (string) $it['name'],
                    max(1, (int) ($it['quantity'] ?? 1)),
                    (int) $it['unit_price_cents'],
                ]);
            }

            $note = $pdo->prepare(
                "INSERT INTO notifications (user_id, title, body) VALUES (?,?,?)"
            );
            $note->execute([$userId, "Order {$reference} paid", "Payment received. We are preparing your flowers."]);
            $pdo->commit();

            $s = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
            $s->execute([$orderId]);
            return $s->fetch();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public function userOrders(int $userId): array
    {
        $pdo = $this->db->getConnection();
        $sql = "SELECT o.* FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function allOrders(): array
    {
        $pdo = $this->db->getConnection();
        return $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
    }
}
