/*******************************************
 * processing.js
 * Скрипт для раздела "Обработка" (создание заявки)
 *******************************************/

// Храним подтверждённые товары (массив)
let submittedArticles = [];

/**
 * Основная функция, которая отображает форму "Обработка"
 * и вставляет её в элемент #dynamicContent (или другой контейнер)
 */
function loadProcessing() {
    const container = document.getElementById("dynamicContent");
    container.innerHTML = `
        <div id="processingFormContainer" class="processing-container">
            <h2 class="form-title">Заявка на Обработку</h2>
            
            <label for="companyName" class="form-label">Введите ИП:</label>
            <input type="text" id="companyName" placeholder="Введите ИП" class="input-field" required>
            
            <label for="storeName" class="form-label">Название Магазина (если не знаете, нажмите Пропустить):</label>
            <input type="text" id="storeName" placeholder="Введите название магазина" class="input-field">
            <button type="button" class="skip-button" onclick="skipStoreName()">Пропустить</button>

            <!-- Выбор типа отправки -->
            <label for="shipmentType" class="form-label">Тип обработки (FBO / FBS):</label>
            <select id="shipmentType" class="input-field" required>
                <option value="FBO">FBO</option>
                <option value="FBS">FBS</option>
            </select>
            
            <h3 class="form-subtitle">Добавление товаров:</h3>
            <div id="articlesContainer"></div>
            <button id="addArticleButton" class="add-button" onclick="addArticle()">➕ Добавить Баркод</button>
            
            <h3 class="summary-title">Итог:</h3>
            <div id="submittedArticles"></div>
            <p class="total-articles">
                Всего подтверждённых позиций: <span id="totalArticles">0</span>
            </p>
            
            <h3 class="form-subtitle">Комментарий:</h3>
            <textarea id="comment" class="input-field"
                      placeholder="Ваши пожелания по упаковке и коробам"
                      oninput="autoSaveComment()"></textarea>
            
            <button class="submit-button" onclick="submitProcessing()">
                Завершить добавление
            </button>
        </div>
    `;
    // Очищаем массив, если надо, при каждом показе формы
    submittedArticles = [];
}

/**
 * Если пользователь не знает название магазина
 */
function skipStoreName() {
    document.getElementById("storeName").value = "Не указано";
}

/**
 * Автоматически сохраняем комментарий (необязательно)
 */
function autoSaveComment() {
    const commentText = document.getElementById("comment").value;
    localStorage.setItem('comment', commentText);
}

/**
 * Добавляет блок ввода новой позиции (Баркод + Количество + распределение по складам)
 */
function addArticle() {
    document.getElementById("addArticleButton").style.display = "none";
    
    const articleDiv = document.createElement("div");
    articleDiv.classList.add("article-entry");
    articleDiv.innerHTML = `
        <input type="text" placeholder="Введите Баркод" class="articleInput" oninput="checkBarcode(this)">
        <input type="number" placeholder="Общее количество" class="articleQty" oninput="calculateTotal(this)">
        
        <h4 class="warehouse-title">Распределение по складам:</h4>
        <div class="warehouses-container">
            <!-- Пример: Коледино -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'koledino')"> Коледино</label>
                <input type="number" name="koledino" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Электросталь -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'elektrostal')"> Электросталь</label>
                <input type="number" name="elektrostal" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Тула -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'tula')"> Тула</label>
                <input type="number" name="tula" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Казань -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'kazan')"> Казань</label>
                <input type="number" name="kazan" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Рязань -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'ryazan')"> Рязань</label>
                <input type="number" name="ryazan" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Котовск -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'kotovsk')"> Котовск</label>
                <input type="number" name="kotovsk" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Краснодар -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'krasnodar')"> Краснодар</label>
                <input type="number" name="krasnodar" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
            <!-- Невинномысск -->
            <div class="warehouse-column">
                <label><input type="checkbox" class="warehouse-checkbox"
                              onchange="toggleWarehouse(this, 'nevinnomyssk')"> Невинномысск</label>
                <input type="number" name="nevinnomyssk" placeholder="Кол-во"
                       class="warehouse-input" style="display:none;" oninput="updateRemaining(this)">
            </div>
        </div>
        
        <p class="remaining-qty">
            Осталось распределить: <span class="remainingCount">0</span>
        </p>
        <p class="error-message" style="color:red; display:none;">
            Ошибка: Введено больше, чем общее количество!
        </p>
        <button class="confirm-button" onclick="confirmArticle(this)">✅ Подтвердить</button>
        <button class="remove-button" onclick="removeArticle(this)">❌ Удалить</button>
    `;
    document.getElementById("articlesContainer").appendChild(articleDiv);
}

/**
 * При изменении чекбокса склады показываем/скрываем поле ввода
 */
function toggleWarehouse(checkbox, warehouse) {
    const input = checkbox.parentElement.nextElementSibling;
    input.style.display = checkbox.checked ? "inline-block" : "none";
    if (!checkbox.checked) input.value = '';
    updateRemaining(input);
}

/**
 * Проверяем штрихкод (заглушка).
 * Можно доработать под проверку формата EAN, UPC и т.п.
 */
function checkBarcode(input) {
    console.log("checkBarcode:", input.value);
}

/**
 * Пересчитываем «Осталось распределить» при вводе количества
 */
function calculateTotal(input) {
    console.log("calculateTotal:", input.value);
    updateRemaining(input);
}

/**
 * Суммируем все поля складов и сверяем с total
 */
function updateRemaining(input) {
    const articleEntry = input.closest(".article-entry");
    const total = parseInt(articleEntry.querySelector(".articleQty").value) || 0;
    let distributed = 0;

    // Суммируем все поля складов
    articleEntry.querySelectorAll(".warehouse-input").forEach(whInput => {
        distributed += parseInt(whInput.value) || 0;
    });

    const remaining = total - distributed;
    const remainingSpan = articleEntry.querySelector(".remainingCount");
    remainingSpan.textContent = remaining;

    const errorMessage = articleEntry.querySelector(".error-message");
    const confirmButton = articleEntry.querySelector(".confirm-button");

    if (remaining < 0) {
        errorMessage.style.display = "block";
        confirmButton.disabled = true;
    } else {
        errorMessage.style.display = "none";
        confirmButton.disabled = false;
    }
}

/**
 * Подтверждаем добавленный товар:
 * - Сохраняем в массив submittedArticles
 * - Отображаем в итоговом блоке
 * - Скрываем форму редактирования
 */
function confirmArticle(button) {
    const articleDiv = button.parentElement;
    const barcode = articleDiv.querySelector(".articleInput").value;
    const totalQty = parseInt(articleDiv.querySelector(".articleQty").value) || 0;
    
    // Собираем распределение по всем складам
    const warehouses = {};
    articleDiv.querySelectorAll(".warehouse-input").forEach(input => {
        const val = parseInt(input.value) || 0;
        if (val > 0) {
            warehouses[input.name] = val;
        }
    });

    // Добавляем в общий массив
    submittedArticles.push({ barcode, totalQty, warehouses });
    updateArticleCount();

    // Добавляем в «Итог»
    const submittedContainer = document.getElementById("submittedArticles");
    const entry = document.createElement("div");
    entry.classList.add("submitted-entry");
    entry.innerHTML = `
        <p>
            <strong>Артикул:</strong> ${barcode} |
            Кол-во: ${totalQty} |
            Склады: ${Object.keys(warehouses).length}
        </p>`;
    submittedContainer.appendChild(entry);

    // Удаляем блок ввода и показываем кнопку «Добавить»
    articleDiv.remove();
    document.getElementById("addArticleButton").style.display = "block";
}

/**
 * Удаление не подтверждённой позиции, если пользователь передумал
 */
function removeArticle(button) {
    button.parentElement.remove();
    document.getElementById("addArticleButton").style.display = "block";
}

/**
 * Обновляем отображение количества подтверждённых позиций
 */
function updateArticleCount() {
    const totalElement = document.getElementById("totalArticles");
    if (totalElement) {
        totalElement.innerText = submittedArticles.length;
    }
}

/**
 * По нажатию «Завершить добавление» отправляем данные на сервер через AJAX
 */
async function submitProcessing() {
    const companyName  = document.getElementById("companyName").value.trim();
    const storeName    = document.getElementById("storeName").value.trim();
    const shipmentType = document.getElementById("shipmentType").value || "FBO";
    const comment      = document.getElementById("comment").value || "";

    // Простые проверки
    if (!companyName) {
        alert("Заполните поле ИП!");
        return;
    }
    if (submittedArticles.length === 0) {
        alert("Добавьте хотя бы один товар!");
        return;
    }

    // Формируем тело запроса
    const requestData = {
        company_name:  companyName,
        store_name:    storeName || "Не указано",
        shipment_type: shipmentType,
        comment:       comment,
        items:         submittedArticles
    };

    try {
        // Отправляем POST на create_order.php (ниже)
        const response = await fetch("create_order.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        // Ответ в формате JSON
        const result = await response.json();

        if (result.success) {
            // Успех
            alert("Заявка успешно создана! Номер заказа: " + result.order_id);
            // Сбрасываем форму, если надо
            submittedArticles = [];
            loadProcessing(); // перезагружаем форму
        } else {
            // Ошибка, выводим сообщение
            alert("Ошибка при создании заявки: " + (result.message || "Неизвестная ошибка"));
        }
    } catch (error) {
        console.error("Ошибка при запросе:", error);
        alert("Сетевая ошибка при создании заявки. Проверьте консоль.");
    }
}
