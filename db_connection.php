<?php
// Данные для подключения к базе данных
$host = 'localhost';
$username = 'u2949641_Paradox';
$password = 'kA5rC6lU8zlU8eX4';
$dbname = 'u2949641_db';

// Создаём подключение к базе данных
$conn = new mysqli($host, $username, $password, $dbname);

// Проверяем соединение
if ($conn->connect_error) {
    die("Ошибка подключения: " . $conn->connect_error);
}

// Устанавливаем кодировку
$conn->set_charset("utf8");
?>
