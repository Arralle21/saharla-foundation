<?php
/* ═══════════════════════════════════════════════
   SAHARLA FOUNDATION — Events API
   Endpoints:
     GET    api.php              → list all events
     GET    api.php?id=1         → single event
     POST   api.php              → create event
     PUT    api.php?id=1         → update event
     DELETE api.php?id=1         → delete event
     POST   api.php?action=login → authenticate
     POST   api.php?action=logout→ end session
═══════════════════════════════════════════════ */

require_once __DIR__ . '/db.php';

// Admin credentials — change these after first deploy
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'saharla2024');
define('SESSION_KEY', 'sf_admin_sess');

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// CORS for local dev
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ['http://localhost:8000', 'http://127.0.0.1:8000'])) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

/* ── Auth endpoints ─────────────────────────── */
if ($action === 'login') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    if (($body['username'] ?? '') === ADMIN_USER && ($body['password'] ?? '') === ADMIN_PASS) {
        $_SESSION[SESSION_KEY] = true;
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'check') {
    echo json_encode(['authenticated' => !empty($_SESSION[SESSION_KEY])]);
    exit;
}

/* ── Public: GET all events (no auth needed) ── */
if ($method === 'GET' && $id === null) {
    $pdo  = getDB();
    $rows = $pdo->query('SELECT * FROM events ORDER BY date DESC')->fetchAll();
    echo json_encode($rows);
    exit;
}

if ($method === 'GET' && $id !== null) {
    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT * FROM events WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }
    echo json_encode($row);
    exit;
}

/* ── All write operations require auth ───────── */
if (empty($_SESSION[SESSION_KEY])) {
    http_response_code(403);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

/* ── POST — create event ─────────────────────── */
if ($method === 'POST' && $action === '') {
    $data  = json_decode(file_get_contents('php://input'), true) ?? [];
    $photo = handlePhotoUpload();

    $pdo  = getDB();
    $stmt = $pdo->prepare('
        INSERT INTO events (title, description, date, location, type, category, photo, report_url)
        VALUES (:title, :description, :date, :location, :type, :category, :photo, :report_url)
    ');
    $stmt->execute([
        'title'       => trim($data['title']       ?? ''),
        'description' => trim($data['description'] ?? ''),
        'date'        => $data['date']              ?? date('Y-m-d'),
        'location'    => trim($data['location']     ?? ''),
        'type'        => in_array($data['type'] ?? '', ['event','news','program']) ? $data['type'] : 'event',
        'category'    => trim($data['category']     ?? ''),
        'photo'       => $photo,
        'report_url'  => trim($data['report_url']   ?? ''),
    ]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

/* ── POST with photo upload (multipart) ──────── */
if ($method === 'POST' && $action === 'upload') {
    $photo = handlePhotoUpload();
    if ($photo) {
        echo json_encode(['ok' => true, 'photo' => $photo]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Upload failed']);
    }
    exit;
}

/* ── PUT — update event ──────────────────────── */
if ($method === 'PUT' && $id !== null) {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];

    $pdo  = getDB();
    // Keep old photo if no new one provided
    $existing = $pdo->prepare('SELECT photo FROM events WHERE id = ?');
    $existing->execute([$id]);
    $old = $existing->fetch();
    if (!$old) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }

    $photo = isset($data['photo']) ? trim($data['photo']) : $old['photo'];

    $stmt = $pdo->prepare('
        UPDATE events SET
            title       = :title,
            description = :description,
            date        = :date,
            location    = :location,
            type        = :type,
            category    = :category,
            photo       = :photo,
            report_url  = :report_url
        WHERE id = :id
    ');
    $stmt->execute([
        'title'       => trim($data['title']       ?? ''),
        'description' => trim($data['description'] ?? ''),
        'date'        => $data['date']              ?? date('Y-m-d'),
        'location'    => trim($data['location']     ?? ''),
        'type'        => in_array($data['type'] ?? '', ['event','news','program']) ? $data['type'] : 'event',
        'category'    => trim($data['category']     ?? ''),
        'photo'       => $photo,
        'report_url'  => trim($data['report_url']   ?? ''),
        'id'          => $id,
    ]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ── DELETE — remove event ───────────────────── */
if ($method === 'DELETE' && $id !== null) {
    $pdo  = getDB();
    // Delete associated photo file if it's a local upload
    $stmt = $pdo->prepare('SELECT photo FROM events WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row && $row['photo'] && str_starts_with($row['photo'], UPLOAD_URL)) {
        $file = __DIR__ . '/' . $row['photo'];
        if (file_exists($file)) @unlink($file);
    }
    $del = $pdo->prepare('DELETE FROM events WHERE id = ?');
    $del->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

/* ── Photo upload helper ─────────────────────── */
function handlePhotoUpload(): string {
    if (empty($_FILES['photo']['tmp_name'])) return '';
    $file = $_FILES['photo'];
    if ($file['error'] !== UPLOAD_ERR_OK) return '';
    if ($file['size'] > MAX_FILE_SIZE) return '';

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, ALLOWED_TYPES)) return '';

    $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
    $name = bin2hex(random_bytes(8)) . '.' . strtolower($ext);

    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
    if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $name)) return '';

    return UPLOAD_URL . $name;
}
