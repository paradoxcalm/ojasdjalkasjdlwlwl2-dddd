<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    die(json_encode(['status' => 'error', 'message' => 'Ошибка подключения: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

// Проверяем, что запрос POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['status' => 'error', 'message' => 'Неверный метод запроса.']));
}

// Проверяем, пришли ли нужные данные
if (!isset($_POST['city'], $_POST['sender'], $_POST['direction'], $_POST['date'], $_POST['shipmentType'], $_POST['paymentType'])) {
    die(json_encode(['status' => 'error', 'message' => 'Отсутствуют обязательные параметры.']));
}

// Получаем данные формы
$city = $_POST['city'];
$sender = $_POST['sender'];
$direction = $_POST['direction'];
$date_of_delivery = $_POST['date'];
$shipment_type = $_POST['shipmentType'];
$boxes = isset($_POST['boxes']) ? intval($_POST['boxes']) : 0;
$payment = isset($_POST['payment']) ? floatval($_POST['payment']) : 0.0;
$payment_type = $_POST['paymentType'];
$comment = $_POST['comment'] ?? '';
$processing = isset($_POST['processing']) ? intval($_POST['processing']) : 0; // Флаг обработки (0 или 1)

// Дата отправки (текущее время)
$submission_date = date('Y-m-d H:i:s');

// **Обработка загрузки фото**
$photo_path = null;
if (!empty($_FILES['photo']['name'])) {
    $uploadDir = 'uploads/'; // Папка для хранения изображений
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $photoName = uniqid() . "_" . basename($_FILES['photo']['name']);
    $targetPath = $uploadDir . $photoName;

    if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetPath)) {
        $photo_path = $targetPath;
    } else {
        die(json_encode(['status' => 'error', 'message' => 'Ошибка загрузки фотографии.']));
    }
}

// Подготовка SQL-запроса для добавления в основную таблицу
$stmt = $conn->prepare("
    INSERT INTO shipments (city, sender, direction, date_of_delivery, shipment_type, boxes, payment, payment_type, submission_date, comment, photo_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    die(json_encode(['status' => 'error', 'message' => 'Ошибка подготовки запроса: ' . $conn->error]));
}

$stmt->bind_param(
    'sssssidssss',
    $city,
    $sender,
    $direction,
    $date_of_delivery,
    $shipment_type,
    $boxes,
    $payment,
    $payment_type,
    $submission_date,
    $comment,
    $photo_path
);

if (!$stmt->execute()) {
    die(json_encode(['status' => 'error', 'message' => 'Ошибка при выполнении запроса: ' . $stmt->error]));
}

$response = ['status' => 'success', 'message' => 'Данные успешно записаны!', 'photo_path' => $photo_path];

// **Если включена обработка, добавляем данные во вторую таблицу**
if ($processing === 1) {
    $stmt_proc = $conn->prepare("
        INSERT INTO processed_shipments (city, sender, direction, date_of_delivery, shipment_type, boxes, payment, payment_type, submission_date, comment, photo_path, processing_flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt_proc) {
        $stmt_proc->bind_param(
            'sssssidssssi',
            $city,
            $sender,
            $direction,
            $date_of_delivery,
            $shipment_type,
            $boxes,
            $payment,
            $payment_type,
            $submission_date,
            $comment,
            $photo_path,
            $processing
        );

        if (!$stmt_proc->execute()) {
            $response['warning'] = 'Ошибка при добавлении в таблицу обработки: ' . $stmt_proc->error;
        }

        $stmt_proc->close();
    } else {
        $response['warning'] = 'Ошибка подготовки запроса для обработки: ' . $conn->error;
    }
}

// Отправляем JSON-ответ
echo json_encode($response);

$stmt->close();
$conn->close();
?>
