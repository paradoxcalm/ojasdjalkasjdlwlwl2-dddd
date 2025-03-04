<?php
header('Content-Type: application/json');

// Данные для подключения к базе данных
$host = 'localhost';
$username = 'u2949641_Paradox';
$password = 'kA5rC6lU8zlU8eX4';
$dbname = 'u2949641_db';

// Подключение к базе данных
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Ошибка подключения к базе данных']));
}

$conn->set_charset("utf8mb4");

// Получаем ID записи
$id = intval($_GET['id'] ?? 0);
if ($id > 0) {
    $stmt = $conn->prepare("SELECT photo_path FROM shipments WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    $photos = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['photo_path']) {
            $photos[] = $row['photo_path'];
        }
    }

    echo json_encode(['photos' => $photos]);
} else {
    echo json_encode(['photos' => []]);
}

$conn->close();
?>
