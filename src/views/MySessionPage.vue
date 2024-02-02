<template>
  <section class="client-section">
    <div class="search margin-search">
      <input type="text" class="search-input" placeholder="Пошук">
    </div>

    <div class="client-list">
      <table class="table">
        <thead>
        <tr>
          <th>Номер сесії</th>
          <th>Дата сесії</th>
          <th>Ім'я клієнта</th>
          <th>Дії</th>
        </tr>
        </thead>
        <tbody>
        <!-- Приклад рядка таблиці -->
        <tr>
          <td>Сесія 1</td>
          <td>14.01.2024</td>
          <td>Андрій</td>
          <td class="all-butt-management">
            <button class="btn-action">
              <img src="@/assets/icons/downloads-client.svg" alt="Завантажити">
            </button>
            <button class="btn-action">
              <img src="@/assets/icons/visible-client.svg" alt="Переглянути">
            </button>
            <button class="btn-action">
              <img src="@/assets/icons/edit-client.svg" alt="Редагувати">
            </button>
<!--            <button class="btn-action">-->
<!--              <img src="@/assets/icons/trash-client.svg" alt="Видалити">-->
<!--            </button>-->
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