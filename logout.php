<?php
session_start();
session_unset();    // Удаляем все переменные сессии
session_destroy();  // Разрушаем сессию

// Очищаем куки сессии
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Перенаправляем на страницу авторизации
header('Location: auth_form.php');
exit();
?>
