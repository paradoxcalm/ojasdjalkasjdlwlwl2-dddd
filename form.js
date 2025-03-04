function loadForm() {
    document.getElementById('dynamicContent').innerHTML = `
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
                    <input type="text" id="sender" name="sender">
                </div>

                <div class="form-group">
                    <label for="direction">Направление:</label>
                    <input type="text" id="direction" name="direction">
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

                <div id="qrImage" style="display: none;">
                    <img id="qrPreview" src="" alt="QR-код для сканирования">
                </div>

                <div class="form-group">
                    <label for="photo">Фотография:</label>
                    <input 
  type="file" 
  id="photos" 
  name="photos[]" 
  accept="image/*" 
  capture="environment" 
  multiple
  required
>

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
    initializeForm();
}

function initializeForm() {
    const form = document.getElementById('dataForm');
    if (!form) return; // Проверяем, что форма существует

    // Слушатель для выбора способа оплаты
    document.getElementById('paymentType').addEventListener('change', function () {
        const qrImage = document.getElementById('qrImage');
        const qrPreview = document.getElementById('qrPreview');
        const paymentType = this.value;

        if (paymentType === "ТБанк") {
            qrImage.style.display = "block";
            qrPreview.src = "./QR/2TBank.jpg";
        } else if (paymentType === "РС") {
            qrImage.style.display = "block";
            qrPreview.src = "./QR/1IP.jpg";
        } else {
            qrImage.style.display = "none";
            qrPreview.src = "";
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const status = document.getElementById('status');
        const button = form.querySelector('button[type="submit"]');

        // Блокируем кнопку
        button.disabled = true;
        button.style.backgroundColor = '#ccc';
        button.textContent = 'Отправка...';

        const formData = new FormData(form);

        try {
            const response = await fetch('log_data.php', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.status === 'success') {
                status.textContent = 'Данные успешно отправлены!';
                status.style.color = 'green';
                form.reset();
            } else {
                status.textContent = `Ошибка: ${result.message}`;
                status.style.color = 'red';
            }
        } catch (error) {
            console.error('Ошибка отправки данных:', error);
            status.textContent = 'Ошибка подключения.';
            status.style.color = 'red';
        } finally {
            // Разблокируем кнопку
            button.disabled = false;
            button.style.backgroundColor = '#4CAF50';
            button.textContent = 'Отправить';
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const status = document.getElementById('status');
    const button = event.target.querySelector('button');

    // Блокировка кнопки
    button.disabled = true;
    button.style.backgroundColor = '#ccc';
    let countdown = 10;
    button.textContent = `Повторная отправка через ${countdown} секунд`;

    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            button.textContent = `Повторная отправка через ${countdown} секунд`;
        } else {
            clearInterval(interval);
            button.disabled = false;
            button.style.backgroundColor = '#4CAF50';
            button.textContent = 'Отправить';
        }
    }, 1000);

    // Создаем FormData
    const formData = new FormData(document.getElementById('dataForm'));

    // Отправка данных
    const response = await fetch('log_data.php', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (data.status === 'success') {
        status.textContent = 'Данные успешно записаны!';
        status.style.color = 'green';
    } else {
        status.textContent = `Ошибка: ${data.message}`;
        status.style.color = 'red';
    }

    // Сброс формы
    document.getElementById('dataForm').reset();
}
