<?php
declare(strict_types=1);

require_once __DIR__ . '/../APIs/database.php';

class UserModel
{
    public function __construct(private readonly Database $db)
    {
    }

    public function create(string $name, string $email, string $password): array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?, 'customer')");
        $stmt->execute([$name, strtolower(trim($email)), password_hash($password, PASSWORD_DEFAULT)]);
        $id = (int) $pdo->lastInsertId();
        $q = $pdo->prepare("SELECT id,name,email,role,avatar_url,phone,address,city FROM users WHERE id = ?");
        $q->execute([$id]);
        return $q->fetch();
    }

    public function verify(string $email, string $password): ?array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([strtolower(trim($email))]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            return null;
        }
        unset($user['password_hash']);
        return $user;
    }

    public function find(int $id): ?array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare("SELECT id,name,email,role,avatar_url,phone,address,city FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function notifications(int $userId): array
    {
        $pdo = $this->db->getConnection();
        $stmt = $pdo->prepare("SELECT id,user_id,title,body,link,is_read AS `read`,created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}
