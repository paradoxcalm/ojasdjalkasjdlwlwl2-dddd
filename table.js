/* Файл: table.js */

/**
 * Функция для загрузки данных и отображения таблицы с пагинацией.
 */
function fetchDataAndDisplayTable(city = '') {
    let url = 'fetch_data.php';
    if (city) url += `?city=${encodeURIComponent(city)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tableContainer = document.getElementById('tableContainer');
            const paginationContainer = document.getElementById('paginationContainer');
            if (!tableContainer) {
                console.error('tableContainer не найден в DOM');
                return;
            }

            if (!data.length) {
                tableContainer.innerHTML = '<p>Нет данных для отображения.</p>';
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';
            const rowsPerPage = 10;
            const totalPages = Math.ceil(data.length / rowsPerPage);
            let currentPage = 1;

            function renderTablePage(page) {
                const start = (page - 1) * rowsPerPage;
                const end = start + rowsPerPage;
                const paginatedData = data.slice(start, end);

                let tableHTML = '<div style="margin-bottom: 20px; text-align: right;">';
                tableHTML += '<input type="text" id="filterInput" onkeyup="filterTable()" placeholder="Поиск..." class="filter-input">';
                tableHTML += '</div>';
                tableHTML += '<table>';
                tableHTML += `
                    <thead>
                        <tr>
                            <th>Отправитель</th>
                            <th>Направление</th>
                            <th>Дата сдачи</th>
                            <th>Дата приёмки</th>
                            <th>Тип отправки</th>
                            <th>Количество</th>
                            <th>Сумма оплаты</th>
                            <th>Способ оплаты</th>
                            <th>Фотоотчет</th>
                            <th>Комментарий</th>
                        </tr>
                    </thead>
                    <tbody>
                `;

                paginatedData.forEach(row => {
                    tableHTML += `
                        <tr>
                            <td>${row.sender}</td>
                            <td>${row.direction}</td>
                            <td>${row.date_of_delivery}</td>
                            <td>${row.submission_date}</td>
                            <td>${row.shipment_type}</td>
                            <td>${row.boxes}</td>
                            <td>${row.payment}</td>
                            <td>${row.payment_type}</td>
                            
                            <td style="text-align: center;">
                                ${row.photo_path 
                                    ? `<img src="${row.photo_path}" alt="Фото" style="max-width: 50px; max-height: 50px; cursor: pointer;" onclick="openPhotoGallery(${row.id})">`
                                    : '<span>Нет фото</span>'}
                            </td>
                            <td>${row.comment || 'Нет комментария'}</td>
                        </tr>
                    `;
                });

                tableHTML += '</tbody></table>';
                tableContainer.innerHTML = tableHTML;
            }

            function renderPagination() {
    paginationContainer.innerHTML = '';
    const maxVisiblePages = 3; // Количество страниц слева и справа от текущей

    function createPageButton(page, text, isActive = false) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('pagination-button');
        if (isActive) button.classList.add('active');
        button.addEventListener('click', () => changePage(page));
        return button;
    }

    if (currentPage > 1) paginationContainer.appendChild(createPageButton(1, '1')); // Первая страница
    if (currentPage > maxVisiblePages + 2) paginationContainer.appendChild(createEllipsis());

    const startPage = Math.max(1, currentPage - maxVisiblePages);
    const endPage = Math.min(totalPages, currentPage + maxVisiblePages);
    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageButton(i, i, i === currentPage));
    }

    if (currentPage < totalPages - maxVisiblePages - 1) paginationContainer.appendChild(createEllipsis());
    if (currentPage < totalPages) paginationContainer.appendChild(createPageButton(totalPages, totalPages)); // Последняя страница

    function createEllipsis() {
        const span = document.createElement('span');
        span.textContent = '...';
        span.classList.add('pagination-ellipsis');
        return span;
    }
}

window.changePage = function (page) {
    currentPage = page;
    renderTablePage(page);
    renderPagination();
};

            renderTablePage(currentPage);
            renderPagination();
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            document.getElementById('tableContainer').innerHTML = '<p>Ошибка при загрузке данных.</p>';
        });
}

/**
 * Функция для фильтрации данных в таблице.
 */
function filterTable() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tableContainer table tbody tr');
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const match = cells.some(cell => cell.textContent.toLowerCase().includes(filterValue));
        row.style.display = match ? '' : 'none';
    });
}

function exportAllDataToExcel() {
    fetch('fetch_data.php')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                alert('Нет данных для выгрузки.');
                return;
            }

            const excelData = [];
            const headers = ['ID', 'Город', 'Отправитель', 'Направление', 'Дата сдачи', 'Тип отправки', 'Количество', 'Оплата', 'Способ оплаты', 'Дата приёмки', 'Фотоотчёт','Комментарий'];
            excelData.push(headers);

            data.forEach(row => {
                excelData.push([
                    row.id,
                    row.city,
                    row.sender,
                    row.direction,
                    row.date_of_delivery,
                    row.shipment_type,
                    row.boxes,
                    row.payment,
                    row.payment_type,
                    row.submission_date,
                    row.photo_path || 'Нет фото',
                    row.comment
                ]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Все данные');

            XLSX.writeFile(workbook, 'all_data.xlsx');
        })
        .catch(error => {
            console.error('Ошибка при выгрузке данных:', error);
            alert('Ошибка при выгрузке данных.');
        });
}
