<?php
session_start();
include 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Если номер начинается с 9, добавляем +7
    if (preg_match('/^9[0-9]{9}$/', $phone)) {
        $phone = '+7' . $phone;
    }

    // Проверяем, совпадают ли пароли
    if ($password !== $confirm_password) {
        header('Location: auth_form.php?error=Пароли не совпадают');
        exit();
    }

    // Проверяем, не занят ли Email
    $query = $conn->prepare("SELECT * FROM usersff WHERE email = ?");
    $query->bind_param("s", $email);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        header('Location: auth_form.php?error=Этот Email уже зарегистрирован');
        exit();
    }

    // Проверяем уникальность телефона
    $query = $conn->prepare("SELECT * FROM usersff WHERE phone = ?");
    $query->bind_param("s", $phone);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        header('Location: auth_form.php?error=Этот номер уже зарегистрирован');
        exit();
    }

    // Хэшируем пароль
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Вставляем нового пользователя в базу данных (роль = client по умолчанию)
    $insert = $conn->prepare("INSERT INTO usersff (email, phone, password, role) VALUES (?, ?, ?, 'client')");
    $insert->bind_param("sss", $email, $phone, $hashed_password);

    if ($insert->execute()) {
        header('Location: auth_form.php?success=Регистрация успешна. Войдите в систему.');
        exit();
    } else {
        header('Location: auth_form.php?error=Ошибка регистрации. Попробуйте снова.');
        exit();
    }
} else {
    header('Location: auth_form.php');
    exit();
}
