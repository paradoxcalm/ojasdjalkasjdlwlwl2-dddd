<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'db_connection.php';

$role = $_SESSION['role'] ?? 'client';
$userId = $_SESSION['user_id'] ?? 0;

$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

$orderId = (int)($data['order_id'] ?? 0);
$newStatus = trim($data['status'] ?? '');

if (!$orderId || !$newStatus) {
    echo json_encode(["success" => false, "message" => "Отсутствуют необходимые данные"]);
    exit;
}

$statusSequence = ["Выгрузите товар", "Товар выгружен", "Готов к обработке", "В обработке", "Готов к отправке"];

try {
    $checkStmt = $conn->prepare("SELECT status, user_id FROM orders WHERE order_id = ?");
    $checkStmt->bind_param("i", $orderId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $order = $result->fetch_assoc();

    if (!$order) {
        echo json_encode(["success" => false, "message" => "Заказ не найден"]);
        exit;
    }

    $currentStatus = $order['status'];
    $currentIndex = array_search($currentStatus, $statusSequence);
    $newIndex = array_search($newStatus, $statusSequence);

    if ($role === 'client' && ($newStatus !== 'Товар выгружен' || $currentStatus !== 'Выгрузите товар')) {
        echo json_encode(["success" => false, "message" => "Клиент может менять только на 'Товар выгружен'"]);
        exit;
    } elseif ($role === 'manager' && $newIndex !== $currentIndex + 1) {
        echo json_encode(["success" => false, "message" => "Менеджер может менять статус только на следующий"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
    $stmt->bind_param("si", $newStatus, $orderId);
    $stmt->execute();

    $histStmt = $conn->prepare("INSERT INTO order_history (order_id, status_change, changed_by) VALUES (?, ?, ?)");
    $statusText = "Статус изменён на: $newStatus";
    $histStmt->bind_param("iss", $orderId, $statusText, $userId);
    $histStmt->execute();

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("Ошибка в update_order_status.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Ошибка при обновлении статуса"]);
}
$conn->close();
?>