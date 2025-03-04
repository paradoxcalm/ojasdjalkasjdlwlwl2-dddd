<?php
header('Content-Type: application/json');

// Данные для подключения к базе данных
$host = 'localhost';
$username = 'u2949641_Paradox';
$password = 'kA5rC6lU8zlU8eX4';
$dbname = 'u2949641_db';

// Подключение к базе данных
$conn = new mysqli($host, $username, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Ошибка подключения к базе данных: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

// Получение города из параметров запроса
$city = $_GET['city'] ?? '';

if ($city) {
    // Подготовка и выполнение запроса с фильтром по городу
    $stmt = $conn->prepare("SELECT * FROM shipments WHERE city = ? ORDER BY id DESC");
    $stmt->bind_param('s', $city);
} else {
    // Если город не указан, получаем все данные
    $stmt = $conn->prepare("SELECT * FROM shipments ORDER BY id DESC");
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    if ($row['photo_path']) {
    $row['photo_path'] = '/' . ltrim($row['photo_path'], '/');
}

    $data[] = $row;
}

echo json_encode($data);

$stmt->close();
$conn->close();
?>
