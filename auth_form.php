<?php
session_start();
if (isset($_SESSION['role'])) {
    header('Location: index.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Авторизация и Регистрация</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #74ebd5 0%, #9face6 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .auth-buttons {
            text-align: center;
            padding: 50px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 350px;
        }

        .auth-buttons h2 {
            margin-bottom: 20px;
            color: #333;
            font-weight: 500;
        }

        .auth-buttons button {
            background: linear-gradient(45deg, #1bab1a, #09e542);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin-bottom: 15px;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .auth-buttons button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
            background-color: #fff;
            margin: 10% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 90%;
            max-width: 400px;
            border-radius: 10px;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 10px;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }

        .modal-close {
            cursor: pointer;
            font-size: 24px;
        }

        .modal-body {
            padding-top: 10px;
        }

        .modal-body input[type="text"],
        .modal-body input[type="email"],
        .modal-body input[type="password"] {
            width: calc(100% - 20px);
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
        }

        .modal-body button {
            width: 100%;
            padding: 10px;
            background: linear-gradient(45deg, #1bab1a, #09e542);
            color: #fff;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .modal-body button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>

<!-- Контейнер с кнопками -->
<div class="auth-buttons">
    <h2>Добро пожаловать!</h2>
    <button onclick="openModal('loginModal')">Вход</button>
    <button onclick="openModal('registerModal')">Регистрация</button>
</div>

<!-- === Модальное окно Входа === -->
<div id="loginModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Вход</h2>
            <span class="modal-close" onclick="closeModal('loginModal')">&times;</span>
        </div>
        <div class="modal-body">
            <form action="auth.php" method="post" onsubmit="formatPhone('loginPhone')">
                <input type="text" name="email_or_phone" id="loginPhone" placeholder="Email или Номер телефона" required>
                <input type="password" name="password" placeholder="Пароль" required>
                <button type="submit">Войти</button>
            </form>
        </div>
    </div>
</div>

<!-- === Модальное окно Регистрации === -->
<div id="registerModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Регистрация</h2>
            <span class="modal-close" onclick="closeModal('registerModal')">&times;</span>
        </div>
        <div class="modal-body">
            <form action="register_action.php" method="post" onsubmit="formatPhone('registerPhone')">
                <input type="email" name="email" placeholder="Email" required>
                <input type="text" name="phone" id="registerPhone" placeholder="Номер телефона (начиная с 9)" pattern="[9][0-9]{9}" required>
                <input type="password" name="password" placeholder="Пароль" required>
                <input type="password" name="confirm_password" placeholder="Повторите пароль" required>
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    </div>
</div>

<script>
    function openModal(modalId) {
        document.getElementById(modalId).style.display = "block";
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }

    // Автоматическое добавление +7
    function formatPhone(inputId) {
        var phoneInput = document.getElementById(inputId);
        var phoneValue = phoneInput.value;
        if (phoneValue && phoneValue[0] === '9') {
            phoneInput.value = '+7' + phoneValue;
        }
    }
</script>
</body>
</html>
