<template>
  <section class="client-section">
    <div class="client-header">
      <button class="btn-add-client">
        Додати клієнта
      </button>
      <button class="btn-refresh">
        <img src="@/assets/icons/refresh.svg" alt="Оновити">
      </button>
    </div>
    <div class="search">
      <input type="text" class="search-input" placeholder="Пошук">
    </div>

    <div class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Ім'я</th>
          <th>Номер телефону</th>
          <th>Прийняв згоду</th>
          <th>Первинне оцінювання</th>
          <th>Дії</th>
        </tr>
        </thead>
        <tbody>
        <!-- Приклад рядка таблиці -->
        <tr>
          <td>Клієнт Іван</td>
          <td>+38095925237</td>
          <td>так</td>
          <td>так</td>
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
        <!-- Подальші рядки... -->
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
<script setup>
</script>