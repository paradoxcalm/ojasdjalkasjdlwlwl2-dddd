<?php
session_start();

// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['role'])) {
    header('Location: auth_form.php');
    exit();
}

// Получаем роль пользователя
$role = $_SESSION['role'];

// Если пользователь — client, при первой загрузке открываем «Обработка»
if ($role === 'client') {
    echo '<script>window.onload = function() { loadProcessing(); };</script>';
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>IDEAL TranSport</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <?php $version = time(); // Версия для сброса кеша ?>

    <!-- Подключаем стили с уникальной версией -->
    <link rel="stylesheet" href="styles/base.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="styles/layout.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="styles/form.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="styles/table.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="styles/buttons.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="styles/responsive.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles/schedule.css?v=<?php echo $version; ?>">
    <link rel="stylesheet" href="styles/processing_styles.css">
    <link rel="stylesheet" href="styles/profile.css?v=<?php echo $version; ?>"> <!-- Стили ЛК -->
</head>
<body>
    <!-- Главная панель -->
    <div class="main-panel">
        <div class="navigation">
            <!-- Приёмка: Доступно для Admin и Manager -->
            <?php if ($role === 'admin' || $role === 'manager') : ?>
                <button class="icon-button" onclick="loadForm()">
                    <i class="fas fa-box"></i>Приёмка
                </button>
            <?php endif; ?>

            <!-- Обработка: Доступно для Admin, Manager и Client -->
            <?php if ($role === 'admin' || $role === 'manager' || $role === 'client') : ?>
                <button class="icon-button" onclick="loadProcessing()">
                    <i class="fas fa-cogs"></i>Обработка
                </button>
            <?php endif; ?>

            <!-- Все заказы: Доступно для Admin и Manager -->
            <?php if ($role === 'admin' || $role === 'manager') : ?>
                <button class="icon-button" onclick="loadAllOrders()">
                    <i class="fas fa-list"></i>Все заказы
                </button>
            <?php endif; ?>

            <!-- График и Статистика: Доступно для Admin и Client -->
            <?php if ($role === 'admin' || $role === 'client') : ?>
                <button class="icon-button" onclick="loadChart()">
                    <i class="fas fa-chart-line"></i>График
                </button>
                <button class="icon-button" onclick="loadStatistics()">
                    <i class="fas fa-chart-pie"></i>Статистика
                </button>
            <?php endif; ?>

            <!-- Личный кабинет: Доступно для всех ролей -->
            <div class="profile-menu">
                <button class="icon-button profile-button" onclick="toggleProfileMenu()">
                    <i class="fas fa-user-circle"></i> Личный кабинет
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    <ul>
                        <li onclick="loadOrders()">Мои заказы</li>
                        <?php if ($role === 'admin') : ?>
                            <li onclick="loadChangeHistory()">История изменений</li>
                        <?php endif; ?>
                        <li onclick="loadNotifications()">Уведомления</li>
                        <li onclick="loadEditData()">Редактирование данных</li>
                        <li onclick="loadSettings()">Настройки</li>
                        <li><a href="logout.php">Выйти</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Динамический контент -->
    <div class="dynamic-content" id="dynamicContent">
        <!-- Контент будет подгружаться сюда -->
    </div>

    <!-- Подключаем скрипты -->
    <script src="lk.js?v=<?php echo $version; ?>"></script>
    <script src="processing.js?v=<?php echo $version; ?>"></script>
    <script src="main.js?v=<?php echo $version; ?>"></script>

    <script>
        // Устанавливаем роль пользователя как глобальную переменную
        const userRole = '<?php echo $_SESSION['role'] ?? 'client'; ?>';

        // Открытие/закрытие выпадающего списка "Личный кабинет"
        function toggleProfileMenu() {
            var dropdown = document.getElementById('profileDropdown');
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        }

        // Скрываем dropdown при клике вне
        window.onclick = function(event) {
            if (!event.target.matches('.profile-button')) {
                var dropdowns = document.getElementsByClassName('profile-dropdown');
                for (var i = 0; i < dropdowns.length; i++) {
                    dropdowns[i].style.display = 'none';
                }
            }
        }
    </script>
</body>
</html>