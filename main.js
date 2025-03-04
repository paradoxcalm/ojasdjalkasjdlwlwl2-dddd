// При загрузке страницы отображаем раздел в зависимости от роли
window.onload = function () {
    // Получаем роль пользователя из PHP
    var userRole = "<?php echo $role; ?>";

    if (userRole === 'client') {
        loadProcessing(); // Функция определена в processing.js
    } else if (userRole === 'admin' || userRole === 'manager') {
        loadForm(); // Для админов и менеджеров открываем раздел "Приёмка"
    }
};

// Функция для отображения раздела "Приёмка"
function loadForm() {
    const dynamicContent = document.getElementById('dynamicContent');
    if (dynamicContent) {
        // Скрываем таблицу, если есть
        const tableSection = document.getElementById('tableSection');
        if (tableSection) tableSection.style.display = 'none';

        // Показываем контейнер "Приёмка" и заполняем его HTML
        dynamicContent.style.display = 'block';
        dynamicContent.innerHTML = `
            <div class="section-container">
                <form id="dataForm">
                    <h1 class="section-title">ПРИЁМКА</h1>
                    <div class="form-group">
                        <label for="city">Город отправления:</label>
                        <select id="city" name="city" required>
                            <option value="">Выберите город</option>
                            <option value="Хасавюрт">Хасавюрт</option>
                            <option value="Махачкала">Махачкала</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sender">Данные отправителя:</label>
                        <input type="text" id="sender" name="sender" required>
                    </div>
                    <div class="form-group">
                        <label for="direction">Направление:</label>
                        <input type="text" id="direction" name="direction" required>
                    </div>
                    <div class="form-group">
                        <label for="date">Дата сдачи:</label>
                        <input type="date" id="date" name="date">
                    </div>
                    <div class="form-group">
                        <label for="shipmentType">Тип отправки:</label>
                        <select id="shipmentType" name="shipmentType">
                            <option value="">Выберите тип отправки</option>
                            <option value="Короба">Короба</option>
                            <option value="Паллеты">Паллеты</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="boxes">Количество:</label>
                        <input type="number" id="boxes" name="boxes">
                    </div>
                    <div class="form-group">
                        <label for="payment">Сумма оплаты:</label>
                        <input type="number" id="payment" name="payment">
                    </div>
                    <div class="form-group">
                        <label for="paymentType">Способ оплаты:</label>
                        <select id="paymentType" name="paymentType" required>
                            <option value="">Выберите способ оплаты</option>
                            <option value="Наличные">Наличные</option>
                            <option value="Долг">Долг</option>
                            <option value="ТБанк">Перевод QR</option>
                            <option value="РС">Расчётный счёт QR</option>
                        </select>
                    </div>
                    <div id="qrImage">
                        <img id="qrPreview" src="" alt="QR-код для сканирования">
                    </div>
                    <div class="form-group">
                        <label for="photo">Фотография:</label>
                        <input type="file" id="photo" name="photo" accept="image/*" capture="environment" required>
                    </div>
                    <div class="form-group">
                        <label for="comment">Комментарий:</label>
                        <textarea id="comment" name="comment" rows="3" placeholder="Введите комментарий"></textarea>
                    </div>
                    <button type="submit">Отправить</button>
                </form>
                <p id="status"></p>
            </div>
        `;
        // Инициализация обработчика формы (функция initializeForm должна быть определена в form.js)
        initializeForm();
    }
}

// Функция для отображения раздела "Таблица"
function loadTable() {
    const dynamicContent = document.getElementById('dynamicContent');
    if (dynamicContent) {
        dynamicContent.style.display = 'none';
    }
    const tableSection = document.getElementById('tableSection');
    if (tableSection) {
        tableSection.style.display = 'block';
        fetchDataAndDisplayTable(); // Функция должна быть определена в table.js
    }
}

// Функция для отображения раздела "Расписание"
function loadChart() {
    const scheduleSection = document.getElementById('scheduleSection');
    if (!scheduleSection) return;

    // Скрываем другие секции
    document.getElementById('dynamicContent').style.display = 'none';
    const tableSection = document.getElementById('tableSection');
    if (tableSection) tableSection.style.display = 'none';

    // Показываем контейнер расписания
    scheduleSection.style.display = 'block';

    const scheduleContainer = document.getElementById('scheduleContainer');
    scheduleContainer.innerHTML = ''; // Очищаем перед загрузкой

    // Создаем новый div для таблицы расписания
    const tableContainer = document.createElement('div');
    tableContainer.id = 'scheduleTable';
    tableContainer.classList.add('schedule-container');
    tableContainer.innerHTML = generateScheduleTable();

    scheduleContainer.appendChild(tableContainer);
}

function generateScheduleTable(weekOffset = 0) {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const monthNames = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    let tableHTML = `<h2 class="schedule-title">Расписание отправок</h2>`;
    tableHTML += `<table class="schedule-table"><thead><tr>`;
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(firstDayOfWeek);
        currentDate.setDate(firstDayOfWeek.getDate() + i);
        const dayNames = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
        const dayName = dayNames[i];
        const day = currentDate.getDate();
        const month = monthNames[currentDate.getMonth()];
        tableHTML += `<th>${dayName} <br> ${day} ${month}</th>`;
    }
    tableHTML += `</tr></thead><tbody><tr>`;
    for (let i = 0; i < 7; i++) {
        tableHTML += `<td class="schedule-cell"></td>`;
    }
    tableHTML += `</tr></tbody></table>`;
    tableHTML += `
        <div class="schedule-controls">
            <button onclick="changeWeek(-1)">← Предыдущая неделя</button>
            <button onclick="changeWeek(1)">Следующая неделя →</button>
        </div>
    `;
    return tableHTML;
}

let currentWeekOffset = 0;
function changeWeek(offset) {
    currentWeekOffset += offset;
    const scheduleTable = document.getElementById('scheduleTable');
    if (scheduleTable) {
        scheduleTable.innerHTML = generateScheduleTable(currentWeekOffset);
    }
}
