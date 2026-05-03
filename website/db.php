<?php
/* ═══════════════════════════════════════════════
   SAHARLA FOUNDATION — Database Config
   Update these values from Hostinger hPanel:
   Databases → MySQL Databases
═══════════════════════════════════════════════ */

define('DB_HOST', 'localhost');
define('DB_NAME', 'YOUR_DB_NAME');      // e.g. u123456789_saharla
define('DB_USER', 'YOUR_DB_USER');      // e.g. u123456789_admin
define('DB_PASS', 'YOUR_DB_PASSWORD');  // the password you set
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', __DIR__ . '/assets/events/');
define('UPLOAD_URL', 'assets/events/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed. Check db.php credentials.']);
        exit;
    }
    return $pdo;
}
