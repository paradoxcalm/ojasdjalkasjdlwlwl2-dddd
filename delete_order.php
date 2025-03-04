<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'db_connection.php';

$data = json_decode(file_get_contents("php://input"), true);
$orderId = $data['order_id'] ?? 0;
$role = $_SESSION['role'] ?? 'client';
$userId = $_SESSION['user_id'] ?? 0;

if (!$orderId) {
    echo json_encode(["success" => false, "message" => "Некорректный ID заказа"]);
    exit;
}

try {
    // Проверяем, существует ли заказ и кому он принадлежит
    $stmt = $conn->prepare("SELECT user_id FROM orders WHERE order_id = ?");
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();

    if (!$order) {
        echo json_encode(["success" => false, "message" => "Заказ не найден"]);
        exit;
    }

    // Если клиент, проверяем, является ли заказ его собственным
    if ($role === 'client' && $order['user_id'] != $userId) {
        echo json_encode(["success" => false, "message" => "Вы можете удалить только свои заказы"]);
        exit;
    }

    // 1. Удаляем историю заказа из `order_history`
    $deleteHistoryStmt = $conn->prepare("DELETE FROM order_history WHERE order_id = ?");
    $deleteHistoryStmt->bind_param("i", $orderId);
    $deleteHistoryStmt->execute();

    // 2. Удаляем товары из `order_items`
    $deleteItemsStmt = $conn->prepare("DELETE FROM order_items WHERE order_id = ?");
    $deleteItemsStmt->bind_param("i", $orderId);
    $deleteItemsStmt->execute();

    // 3. Удаляем сам заказ
    $deleteOrderStmt = $conn->prepare("DELETE FROM orders WHERE order_id = ?");
    $deleteOrderStmt->bind_param("i", $orderId);
    $deleteOrderStmt->execute();

    if ($deleteOrderStmt->affected_rows === 0) {
        echo json_encode(["success" => false, "message" => "Ошибка при удалении заказа"]);
        exit;
    }

    echo json_encode(["success" => true, "message" => "Заказ успешно удалён"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Ошибка удаления: " . $e->getMessage()]);
}
?>
