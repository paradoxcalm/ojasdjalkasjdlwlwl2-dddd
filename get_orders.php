<?php
// get_orders.php
// Возвращает JSON со списком заказов, включая связанные товары из order_items
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once 'db_connection.php';

$role   = $_SESSION['role']    ?? 'client';
$userId = $_SESSION['user_id'] ?? 0;
$all    = isset($_GET['all']) ? (int)$_GET['all'] : 0;
$status = $_GET['status'] ?? ''; // Получаем параметр status из запроса

try {
    // Подготовка SQL-запроса
    $sql = "SELECT * FROM orders";
    $params = [];
    $types = '';

    if (($role === 'client' || !$all) && $userId > 0) {
        // Клиент: показываем только его заказы
        $sql .= " WHERE user_id = ?";
        $params[] = $userId;
        $types .= "i";
    }

    // Если указан статус и это не клиент (админ/менеджер), добавляем фильтр
    if ($status && $role !== 'client') {
        $sql .= ($all && empty($params) ? " WHERE" : " AND") . " status = ?";
        $params[] = $status;
        $types .= "s";
    }

    $sql .= " ORDER BY order_date DESC";
    $stmt = $conn->prepare($sql);

    // Привязываем параметры, если они есть
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orderId = $row['order_id'];

        // Подгружаем товары (items) этого заказа
        $sqlItems = "SELECT 
                        item_id,
                        barcode,
                        total_qty,
                        koledino_qty,
                        elektrostal_qty,
                        tula_qty,
                        kazan_qty,
                        ryazan_qty,
                        kotovsk_qty,
                        krasnodar_qty,
                        nevinnomyssk_qty,
                        remaining_qty
                     FROM order_items
                     WHERE order_id = ?";
        $itemsStmt = $conn->prepare($sqlItems);
        $itemsStmt->bind_param("i", $orderId);
        $itemsStmt->execute();
        $itemsRes = $itemsStmt->get_result();

        $itemsArr = [];
        while ($itemRow = $itemsRes->fetch_assoc()) {
            $itemsArr[] = [
                "item_id"           => $itemRow['item_id'],
                "barcode"           => $itemRow['barcode'],
                "total_qty"         => $itemRow['total_qty'],
                "koledino_qty"      => $itemRow['koledino_qty'],
                "elektrostal_qty"   => $itemRow['elektrostal_qty'],
                "tula_qty"          => $itemRow['tula_qty'],
                "kazan_qty"         => $itemRow['kazan_qty'],
                "ryazan_qty"        => $itemRow['ryazan_qty'],
                "kotovsk_qty"       => $itemRow['kotovsk_qty'],
                "krasnodar_qty"     => $itemRow['krasnodar_qty'],
                "nevinnomyssk_qty"  => $itemRow['nevinnomyssk_qty'],
                "remaining_qty"     => $itemRow['remaining_qty']
            ];
        }

        // Добавляем поле is_rejected для отображения отклонённых заказов
        $rejectedStmt = $conn->prepare("SELECT COUNT(*) FROM order_history WHERE order_id = ? AND status_change = 'Выгрузка отклонена'");
        $rejectedStmt->bind_param("i", $orderId);
        $rejectedStmt->execute();
        $rejectedResult = $rejectedStmt->get_result()->fetch_row();
        $isRejected = $rejectedResult[0] > 0;

        $orders[] = [
            "order_id"      => $row['order_id'],
            "order_date"    => $row['order_date'],
            "company_name"  => $row['company_name'],
            "store_name"    => $row['store_name'],
            "shipment_type" => $row['shipment_type'],
            "comment"       => $row['comment'],
            "status"        => $row['status'],
            "items"         => $itemsArr,
            "is_rejected"   => $isRejected
        ];
    }

    echo json_encode(["success" => true, "orders" => $orders]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>