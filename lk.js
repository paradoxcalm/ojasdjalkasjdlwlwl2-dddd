/*******************************************
 * lk.js
 * Скрипты для Личного кабинета (карточки заказов + скрытие нулевых складов)
 *******************************************/

// Загрузка заказов клиента
async function loadOrders() {
    console.log("loadOrders вызвана");
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = '<h2>Мои заказы</h2><p>Загрузка...</p>';

    try {
        const response = await fetch('get_orders.php?all=0');
        if (!response.ok) throw new Error('HTTP error: ' + response.status);
        const result = await response.json();
        console.log("Ответ get_orders.php (мои заказы):", result);

        if (!result.success) {
            dynamicContent.innerHTML = '<p>Ошибка: ' + (result.message || 'Неизвестная ошибка') + '</p>';
            return;
        }

        const orders = result.orders;
        if (!orders || orders.length === 0) {
            dynamicContent.innerHTML = '<h2>Мои заказы</h2><p>Заказов нет.</p>';
            return;
        }

        dynamicContent.innerHTML = `
            <h2>Мои заказы</h2>
            <div class="orders-cards-container">
                ${renderOrderCards(orders, userRole)}
            </div>
        `;
    } catch (error) {
        console.error("Ошибка loadOrders:", error);
        dynamicContent.innerHTML = '<p>Ошибка при загрузке заказов: ' + error.message + '</p>';
    }
}

// Загрузка всех заказов (для админов и менеджеров) с фильтром
async function loadAllOrders() {
    console.log("loadAllOrders вызвана");
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = `
        <h2>Все заказы</h2>
        <select id="statusFilter" onchange="filterOrders()">
            <option value="">Все статусы</option>
            <option value="Ожидающие подтверждения">Ожидающие подтверждения</option>
            <option value="Выгрузите товар">Выгрузите товар</option>
            <option value="Товар выгружен">Товар выгружен</option>
            <option value="Готов к обработке">Готов к обработке</option>
            <option value="В обработке">В обработке</option>
            <option value="Готов к отправке">Готов к отправке</option>
        </select>
        <div id="ordersContainer"><p>Загрузка...</p></div>
    `;

    await filterOrders();
}

// Фильтрация заказов по статусу
async function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const url = statusFilter === "" ? 'get_orders.php?all=1' : 
                (statusFilter === "Ожидающие подтверждения" ? 'get_orders.php?all=1&status=Товар выгружен' : 
                `get_orders.php?all=1&status=${encodeURIComponent(statusFilter)}`);
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('HTTP error: ' + response.status);
        const result = await response.json();
        console.log("Ответ get_orders.php (фильтр):", result);

        if (!result.success) {
            document.getElementById('ordersContainer').innerHTML = '<p>Ошибка: ' + (result.message || 'Неизвестная ошибка') + '</p>';
            return;
        }

        let orders = result.orders;
        if (!orders || orders.length === 0) {
            document.getElementById('ordersContainer').innerHTML = '<p>Заказов нет.</p>';
            return;
        }

        if (statusFilter === "") {
            const statusPriority = {
                "Товар выгружен": 1,
                "Готов к обработке": 2,
                "В обработке": 3,
                "Готов к отправке": 4,
                "Выгрузите товар": 5
            };
            orders.sort((a, b) => {
                const priorityA = statusPriority[a.status] || 6;
                const priorityB = statusPriority[b.status] || 6;
                if (priorityA === priorityB) {
                    return new Date(b.order_date) - new Date(a.order_date);
                }
                return priorityA - priorityB;
            });
        }

        document.getElementById('ordersContainer').innerHTML = renderOrderCards(orders, userRole);
    } catch (error) {
        console.error("Ошибка filterOrders:", error);
        document.getElementById('ordersContainer').innerHTML = '<p>Ошибка при загрузке заказов: ' + error.message + '</p>';
    }
}

// Рендеринг карточек заказов
function renderOrderCards(orders, userRole) {
    const statusSequence = ["Выгрузите товар", "Товар выгружен", "Готов к обработке", "В обработке", "Готов к отправке"];
    let html = '';
    for (const order of orders) {
        let statusClass = '';
        switch (order.status) {
            case 'Выгрузите товар': statusClass = 'status-new'; break;
            case 'Товар выгружен': statusClass = 'status-in-progress'; break;
            case 'Готов к обработке': statusClass = 'status-in-progress'; break;
            case 'В обработке': statusClass = 'status-in-progress'; break;
            case 'Готов к отправке': statusClass = 'status-ready'; break;
            default: statusClass = 'status-unknown';
        }

        html += `
            <div class="order-card">
                <div class="order-card-header">
                    <div>
                        <p><strong>ID:</strong> ${order.order_id}</p>
                        <p><strong>Дата:</strong> ${order.order_date}</p>
                        <p><strong>ИП:</strong> ${order.company_name || '---'}</p>
                        <p><strong>Тип:</strong> ${order.shipment_type || '---'}</p>
                    </div>
                    <div class="order-card-status">
                        <span class="status-badge ${statusClass}">${order.status || 'Не указан'}</span>
                        ${order.is_rejected && order.status === 'Выгрузите товар' ? '<p style="color:red">Выгрузка отклонена</p>' : ''}
                    </div>
                </div>
                <div class="order-card-actions">
                    <button class="btn show-details-btn" onclick="showOrderDetailsModal(${order.order_id}, '${escapeHtml(JSON.stringify(order))}')">Показать детали</button>
        `;

        if (userRole === 'client' && order.status === 'Выгрузите товар') {
            html += `
                <button class="btn status-btn" onclick="updateOrderStatus(${order.order_id}, 'Товар выгружен', 'confirm')">Товар выгружен</button>
            `;
        }

        if (userRole === 'manager' && order.status !== 'Готов к отправке') {
            const currentIndex = statusSequence.indexOf(order.status);
            const nextStatus = statusSequence[currentIndex + 1];
            html += `
                <button class="btn status-btn" onclick="updateOrderStatus(${order.order_id}, '${nextStatus}', 'confirm')">Готово (${nextStatus})</button>
                <button class="btn delete-btn" onclick="updateOrderStatus(${order.order_id}, 'Выгрузите товар', 'reject')">Отклонить</button>
            `;
        }

        if (userRole === 'admin') {
            html += `
                <select class="status-select" onchange="updateOrderStatus(${order.order_id}, this.value, 'confirm')">
                    <option value="">Выберите статус</option>
                    ${statusSequence.map(status => `
                        <option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>
                    `).join('')}
                </select>
                <button class="btn history-btn" onclick="loadOrderHistory(${order.order_id})">История</button>
            `;
        }

        html += `
                    <button class="btn delete-btn" onclick="deleteOrder(${order.order_id})">Удалить</button>
                </div>
            </div>
        `;
    }
    return html;
}

// Экранирование HTML для безопасности
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Показать модальное окно с деталями заказа
function showOrderDetailsModal(orderId, orderJson) {
    const order = JSON.parse(orderJson);
    const modalHtml = `
        <div class="order-modal" id="orderModal_${orderId}">
            <div class="order-modal-content">
                <span class="modal-close" onclick="closeOrderDetailsModal('orderModal_${orderId}')">&times;</span>
                <h2>Детали заказа #${orderId}</h2>
                <p><strong>Название магазина:</strong> ${order.store_name || 'Не указано'}</p>
                <p><strong>Комментарий:</strong> ${order.comment || ''}</p>
                <hr>
                <p style="font-style:italic;">Список товаров:</p>
                <div class="order-items-list">${renderItemsList(order.items)}</div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById(`orderModal_${orderId}`);
    modal.style.display = 'block';

    // Закрытие при клике вне модального окна
    window.onclick = function(event) {
        if (event.target === modal) {
            closeOrderDetailsModal(`orderModal_${orderId}`);
        }
    };
}

// Закрыть модальное окно
function closeOrderDetailsModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Рендеринг списка товаров по городам с аккордеоном
function renderItemsList(items) {
    if (!items || items.length === 0) return '<p>Нет товаров.</p>';

    const cities = {};
    const warehouseFields = {
        'koledino_qty': 'Коледино', 'elektrostal_qty': 'Электросталь', 'tula_qty': 'Тула',
        'kazan_qty': 'Казань', 'ryazan_qty': 'Рязань', 'kotovsk_qty': 'Котовск',
        'krasnodar_qty': 'Краснодар', 'nevinnomyssk_qty': 'Невинномысск'
    };

    items.forEach(item => {
        for (const [field, city] of Object.entries(warehouseFields)) {
            const qty = item[field];
            if (qty && qty > 0) {
                if (!cities[city]) cities[city] = [];
                cities[city].push({ barcode: item.barcode, qty: qty });
            }
        }
    });

    let html = '<div class="cities-container">';
    for (const [city, barcodes] of Object.entries(cities)) {
        const totalQty = barcodes.reduce((sum, b) => sum + b.qty, 0);
        html += `
            <div class="city-item">
                <div class="city-header" onclick="toggleCityDetails('${city}')">
                    <span>${city} (Товаров: ${barcodes.length}, Всего: ${totalQty} шт)</span>
                    <span class="accordion-arrow">▶</span>
                </div>
                <div class="city-details" id="city_${city}" style="display:none;">
                    <ul>
                        ${barcodes.map(b => `<li>Barcode: ${b.barcode} - ${b.qty} шт</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    html += '</div>';

    return html;
}

// Переключение видимости деталей города
function toggleCityDetails(city) {
    const currentDetails = document.getElementById(`city_${city}`);
    const currentArrow = currentDetails.previousElementSibling.querySelector('.accordion-arrow');

    document.querySelectorAll('.city-details').forEach(details => {
        if (details !== currentDetails && details.style.display === 'block') {
            details.style.display = 'none';
            details.previousElementSibling.querySelector('.accordion-arrow').classList.remove('open');
        }
    });

    if (currentDetails.style.display === 'none') {
        currentDetails.style.display = 'block';
        currentArrow.classList.add('open');
    } else {
        currentDetails.style.display = 'none';
        currentArrow.classList.remove('open');
    }
}

// Обновление статуса заказа
async function updateOrderStatus(orderId, newStatus, action) {
    if (!newStatus) return;
    try {
        const response = await fetch("update_order_status.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId, status: newStatus, action: action })
        });
        const result = await response.json();
        console.log("Response from update_order_status.php:", result);

        if (result.success) {
            alert(action === 'reject' ? "Заказ отклонён" : "Статус заказа изменён!");
            if (userRole === 'client') loadOrders();
            else loadAllOrders();
        } else {
            alert("Ошибка при изменении статуса: " + (result.message || 'Неизвестно'));
        }
    } catch (err) {
        console.error("Network error in updateOrderStatus:", err);
        alert("Сетевая ошибка при изменении статуса");
    }
}

// Загрузка истории изменений
async function loadOrderHistory(orderId) {
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = '<h2>История изменений</h2><p>Загрузка...</p>';
    try {
        const response = await fetch(`get_order_history.php?order_id=${orderId}`);
        if (!response.ok) throw new Error('HTTP error: ' + response.status);
        const result = await response.json();
        console.log("Order history response:", result);

        if (!result.success) {
            dynamicContent.innerHTML = '<p>Ошибка: ' + (result.message || 'Неизвестная ошибка') + '</p>';
            return;
        }

        const history = result.history;
        if (!history || history.length === 0) {
            dynamicContent.innerHTML = '<h2>История изменений</h2><p>История пуста.</p>';
            return;
        }

        let html = `<h2>История изменений заказа #${orderId}</h2><ul>`;
        for (const entry of history) {
            html += `<li><strong>${entry.change_date}</strong>: ${entry.status_change} (изменено: ${entry.changed_by})</li>`;
        }
        html += '</ul><button class="btn" onclick="loadAllOrders()">Назад</button>';
        dynamicContent.innerHTML = html;
    } catch (error) {
        console.error("Ошибка loadOrderHistory:", error);
        dynamicContent.innerHTML = '<p>Ошибка при загрузке истории: ' + error.message + '</p>';
    }
}

// Удаление заказа
async function deleteOrder(orderId) {
    if (!confirm(`Вы уверены, что хотите удалить заказ #${orderId}?`)) return;

    try {
        const response = await fetch('delete_order.php', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId })
        });
        const result = await response.json();
        console.log("Response from delete_order.php:", result);

        if (result.success) {
            alert(result.message || "Заказ успешно удалён!");
            if (userRole === 'client') loadOrders();
            else loadAllOrders();
        } else {
            alert("Ошибка при удалении: " + (result.message || 'Неизвестно'));
        }
    } catch (err) {
        console.error("Network error in deleteOrder:", err);
        alert("Сетевая ошибка при удалении заказа");
    }
}

// Заглушки для остальных функций
function loadNotifications() {
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = '<h2>Уведомления</h2><p>Тут будут уведомления.</p>';
}

function loadEditData() {
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = '<h2>Редактирование данных</h2><p>Тут можно изменить ИП, Название магазина и т.д.</p>';
}

function loadSettings() {
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = '<h2>Настройки</h2><p>Раздел с настройками пользователя.</p>';
}

function loadChangeHistory() {
    const dynamicContent = document.getElementById("dynamicContent");
    dynamicContent.innerHTML = '<h2>История изменений</h2><p>Выберите заказ для просмотра истории.</p>';
}
