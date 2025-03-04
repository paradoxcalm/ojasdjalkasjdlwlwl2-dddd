<?php
session_start();
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email_or_phone = $_POST['email_or_phone'];
    $password = $_POST['password'];

    // Если введён номер телефона, который начинается с 9, добавляем +7
    if (preg_match('/^9[0-9]{9}$/', $email_or_phone)) {
        $email_or_phone = '+7' . $email_or_phone;
    }

    // Проверяем по email или номеру телефона
    $query = $conn->prepare("SELECT * FROM usersff WHERE (email = ? OR phone = ?) LIMIT 1");
    $query->bind_param("ss", $email_or_phone, $email_or_phone);
    $query->execute();
    $result = $query->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];

        // Перенаправляем в зависимости от роли
        if ($user['role'] === 'admin') {
            header('Location: index.php');
        } elseif ($user['role'] === 'manager') {
            header('Location: index.php');
        } elseif ($user['role'] === 'client') {
            header('Location: index.php');
        }  
        exit();
    } else {
        header('Location: auth_form.php?error=Неправильный Email, номер или пароль');
        exit();
    }
} else {
    header('Location: auth_form.php');
    exit();
}
