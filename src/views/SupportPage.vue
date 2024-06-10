<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Запис
      </button>
      <button class="btn-refresh">
        <img src="@/assets/icons/refresh.svg" alt="Оновити">
      </button>
    </div>
    <div class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Тип підтримки</th>
          <th>Дата проведення</th>
<!--          <th>Дії</th>-->
        </tr>
        </thead>
        <tbody>
        <!-- Приклад рядка таблиці -->
        <tr>
          <td>Супервізія</td>
          <td>18.02.2024</td>
          <td class="all-butt-management">
            <button class="btn-action">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action">
              <img src="@/assets/icons/edit-client.svg" alt="Редагувати">
            </button>
            <button class="btn-action">
              <img src="@/assets/icons/trash-client.svg" alt="Видалити">
            </button>
          </td>
        </tr>
        <tr>
          <td>Інтервізія</td>
          <td>01.03.2024</td>
          <td class="all-butt-management">
            <button class="btn-action">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action">
              <img src="@/assets/icons/edit-client.svg" alt="Редагувати">
            </button>
            <button class="btn-action">
              <img src="@/assets/icons/trash-client.svg" alt="Видалити">
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="client-footer">
      <div class="pagination-info">
        Сторінка 1 з 10
      </div>
      <div class="pagination-controls">
        <button class="btn-pagination before">назад</button>
        <button class="btn-pagination after">далі</button>
      </div>
    </div>
  </section>
</template>
<script>
</script>