<?php
// Подключаем библиотеку PhpSpreadsheet
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Настройки подключения к базе данных
$host = 'localhost'; // Хост базы данных
$username = 'u2949641_Paradox'; // Имя пользователя
$password = 'kA5rC6lU8zlU8eX4'; // Пароль
$database = 'u2949641_db'; // Имя базы данных

// Подключение к базе данных
$conn = new mysqli($host, $username, $password, $database);

// Проверка подключения
if ($conn->connect_error) {
    die("Ошибка подключения: " . $conn->connect_error);
}

// SQL-запрос для получения данных
$sql = "SELECT * FROM shipments"; // Замените на название вашей таблицы
$result = $conn->query($sql);

// Проверяем, есть ли данные
if ($result->num_rows > 0) {
    // Создаем новый объект Spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Заголовки столбцов
    $columns = ['ID', 'Город', 'Отправитель', 'Направление', 'Дата сдачи', 'Тип отправки', 'Количество', 'Оплата', 'Способ оплаты', 'Дата отправки', 'Фотоотчет'];
    $columnIndex = 1;

    foreach ($columns as $column) {
        $sheet->setCellValueByColumnAndRow($columnIndex, 1, $column); // Устанавливаем заголовки в первую строку
        $columnIndex++;
    }

    // Заполняем данные из базы
    $rowIndex = 2; // Начинаем со второй строки
    while ($row = $result->fetch_assoc()) {
        $sheet->setCellValueByColumnAndRow(1, $rowIndex, $row['id']);
        $sheet->setCellValueByColumnAndRow(2, $rowIndex, $row['city']);
        $sheet->setCellValueByColumnAndRow(3, $rowIndex, $row['sender']);
        $sheet->setCellValueByColumnAndRow(4, $rowIndex, $row['direction']);
        $sheet->setCellValueByColumnAndRow(5, $rowIndex, $row['date_of_delivery']);
        $sheet->setCellValueByColumnAndRow(6, $rowIndex, $row['shipment_type']);
        $sheet->setCellValueByColumnAndRow(7, $rowIndex, $row['boxes']);
        $sheet->setCellValueByColumnAndRow(8, $rowIndex, $row['payment']);
        $sheet->setCellValueByColumnAndRow(9, $rowIndex, $row['payment_type']);
        $sheet->setCellValueByColumnAndRow(10, $rowIndex, $row['submission_date']);
        $sheet->setCellValueByColumnAndRow(11, $rowIndex, $row['photo_path'] ? $row['photo_path'] : 'Нет фото');
        $rowIndex++;
    }

    // Устанавливаем имя файла
    $fileName = "exported_data.xlsx";

    // Сохраняем файл в формате Excel
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $fileName . '"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output'); // Отправляем файл на скачивание
    exit();
} else {
    echo "Нет данных для экспорта.";
}

// Закрываем соединение с базой данных
$conn->close();
?>
