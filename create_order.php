<?php
// create_order.php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Подключаемся к базе
require_once 'db_connection.php'; // <-- ваш файл с $conn

// Считываем сырые данные JSON
$rawData = file_get_contents('php://input');
if (!$rawData) {
    echo json_encode(["success" => false, "message" => "No input data received"]);
    exit;
}

// Парсим JSON
$data = json_decode($rawData, true);
if (!is_array($data)) {
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}

// Извлекаем поля
$company_name   = $data['company_name']   ?? '';
$store_name     = $data['store_name']     ?? '';
$shipment_type  = $data['shipment_type']  ?? 'FBO';
$comment        = $data['comment']        ?? '';
$items          = $data['items']          ?? [];

// Проверяем, что user_id у нас есть в сессии
$userId = $_SESSION['user_id'] ?? 0; 
if ($userId === 0) {
    // Если пользователь не авторизован, выводим ошибку
    echo json_encode(["success" => false, "message" => "User is not logged in"]);
    exit;
}

// Небольшие проверки
if (!$company_name || empty($items)) {
    echo json_encode(["success" => false, "message" => "Required fields are missing"]);
    exit;
}

// Начинаем транзакцию (по желанию, чтобы в случае ошибки всё откатить)
$conn->begin_transaction();

try {
    // 1) Создаём заказ в таблице orders
    // Поля: (company_name, store_name, shipment_type, comment, status, user_id)
    $status = 'Выгрузите товар'; 
    $stmt = $conn->prepare("
        INSERT INTO orders (company_name, store_name, shipment_type, comment, status, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("sssssi", $company_name, $store_name, $shipment_type, $comment, $status, $userId);
    $stmt->execute();

    // Получаем ID вставленной записи
    $orderId = $stmt->insert_id;

    // 2) Добавляем позиции в order_items
    // Поля: order_id, barcode, total_qty, koledino_qty, elektrostal_qty, ...
    // remaining_qty = total_qty - сумма распределения
    $insertItemSQL = "
        INSERT INTO order_items (
            order_id,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $itemStmt = $conn->prepare($insertItemSQL);

    foreach ($items as $item) {
        $barcode  = $item['barcode']   ?? '';
        $totalQty = (int)($item['totalQty'] ?? 0);
        $wh       = $item['warehouses'] ?? [];

        // Вытаскиваем распределения
        $koledino     = (int)($wh['koledino']     ?? 0);
        $elektrostal  = (int)($wh['elektrostal']  ?? 0);
        $tula         = (int)($wh['tula']         ?? 0);
        $kazan        = (int)($wh['kazan']        ?? 0);
        $ryazan       = (int)($wh['ryazan']       ?? 0);
        $kotovsk      = (int)($wh['kotovsk']      ?? 0);
        $krasnodar    = (int)($wh['krasnodar']    ?? 0);
        $nevinnomyssk = (int)($wh['nevinnomyssk'] ?? 0);

        // Сумма распределённых
        $distributed = $koledino + $elektrostal + $tula + $kazan + $ryazan + $kotovsk + $krasnodar + $nevinnomyssk;
        $remaining   = $totalQty - $distributed;

        $itemStmt->bind_param("isiiiiiiiiii",
            $orderId,
            $barcode,
            $totalQty,
            $koledino,
            $elektrostal,
            $tula,
            $kazan,
            $ryazan,
            $kotovsk,
            $krasnodar,
            $nevinnomyssk,
            $remaining
        );
        $itemStmt->execute();
    }

    // 3) Добавляем запись в order_history (логируем создание заказа)
    $changedBy   = $_SESSION['role'] ?? 'client'; 
    $statusText  = "Заказ создан: " . $status;
    $historySql  = "
        INSERT INTO order_history (order_id, status_change, changed_by)
        VALUES (?, ?, ?)
    ";
    $historyStmt = $conn->prepare($historySql);
    $historyStmt->bind_param("iss", $orderId, $statusText, $changedBy);
    $historyStmt->execute();

    // Если всё ОК — фиксируем транзакцию
    $conn->commit();

    // Возвращаем JSON
    echo json_encode(["success" => true, "order_id" => $orderId]);

} catch (Exception $e) {
    // В случае ошибки откатываем
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
