<!--template form-->
<template>
  <div>
    <div class="profile_tittle">
      <p>
        Створити нову форму
      </p>
    </div>
    <hr class="hr_profile">
  </div>
  <div class="form-bank-info-container">
    <!-- Форма для створення шаблону -->
    <form class="name-update-form" @submit.prevent="handleSubmit">
      <div class="forms-name-add">
        <div class="container-input">
          <label for="formType">Виберіть тип шаблону</label>
          <select id="formType" v-model="form.formType">
            <option disabled value="">Будь ласка, виберіть шаблон</option>
            <option value="consent_individual">Інформована згода індивідуальна</option>
            <option value="consent_couple">Інформована згода парна</option>
            <option value="primary_poll_individual">Первинне опитування індивідуальне</option>
            <option value="primary_poll_couple">Первинне опитування парне</option>
            <option value="individual_consultation">Індивідуальна консультація</option>
            <option value="couple_consultation">Парна консультація</option>
<!--            <option value="reviews">Відгук клієнта</option>-->
          </select>
        </div>
      </div>
      <div class="forms-name-add">
        <div class="container-input">
          <label for="title">Назва шаблону</label>
          <input
              type="text"
              id="title"
              v-model="form.title"
              :class="{ 'is-invalid': v$.title.$dirty && v$.title.required.$invalid }"
              placeholder="Введіть назву шаблону"
          >
        </div>
        <span class="validate-error" v-if="v$.title.$dirty && v$.title.required.$invalid">Це поле не може бути пустим</span>
      </div>

      <!--      <button type="submit" class="btn-submit">Задати назву</button>-->
      <div class="container-global-form-edit">
        <button class="global-form-edit" type="submit">
          <img src="@/assets/icons/edit-form.svg" alt="Send name form">
          <span class="edit-link">Задати назву</span>
        </button>
      </div>
    </form>

    <!-- Умовний рендеринг для додавання елементів форми, якщо форма створена -->
    <div v-if="createdFormId">
      <div class="undertittle-on-bank-ifro">
        <p>Додати елемент форми</p>
      </div>
      <div class="form-items">
        <!-- Відображення динамічних полів форми -->
        <div
            v-for="(item, index) in form.formItems"
            :key="index"
            class="form-item"
        >
          <div class="forms-name-add">
            <div class="container-input">
              <label for="Namefield">Назва поля</label>
              <input
                  id="Namefield"
                  type="text"
                  v-model="item.field_name"

                  placeholder="Введіть назву для цього поля"
              >
            </div>
<!--            <span class="validate-error" v-if=":class="{'is-invalid': v$.formItems.$each[index].field_name.$dirty && v$.formItems.$each[index].field_name.$error}"">Це поле не може бути пустим</span>-->
          </div>
          <div class="forms-name-add">
            <div class="container-input">
              <label for="Typefield">Виберіть тип поля</label>
              <select
                  id="Typefield"
                  v-model="item.field_type"
              >
                <option value="text">Довгий текст</option>
                <option value="string">Короткий текст</option>
                <option value="boolean">Так / Ні</option>
                <option value="ranking1to5">Ранжування від 1 до 5</option>
                <option value="ranking1to10">Ранжування від 1 до 10</option>
              </select>
            </div>
          </div>

          <div class="container-global-form-edit">
            <button class="global-form-edit" type="button" @click="removeFormItem(index)">
              <img src="@/assets/icons/form-minus-white.svg" alt="delete name form">
              <span class="edit-link">Видалити поле</span>
            </button>
          </div>
        </div>
      </div>
      <div class="bank-button-forms">
        <!-- Кнопка для додавання нового елементу форми -->
        <div class="container-global-form-edit">
          <button class="global-form-edit" type="button" @click="addFormItem">
            <img src="@/assets/icons/more.svg" alt="Add name form">
            <span class="edit-link">Додати поле</span>
          </button>
        </div>
        <!-- Кнопка для фінального створення шаблону форми -->
        <div class="container-global-form-edit create-template">
          <button class="global-form-edit" type="button" @click="submitFormItems">
            <img src="@/assets/icons/form-check-white.svg" alt="Check name form">
            <span class="edit-link">Створити шаблон</span>
          </button>
        </div>
      </div>
      </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import apiService from '@/services/apiService';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import M from 'materialize-css';
import router from "@/router";
export default {
  setup() {
    // Реактивний об'єкт для форми
    const form = reactive({
      title: '',
      formType: '',
      formItems: [{ field_name: '', field_type: 'text' }],
    });

    const rules = {
      title: { required }
    };

    // Використання Vuelidate
    const v$ = useVuelidate(rules, form);
    const createdFormId = ref('');

    // Методи
    const addFormItem = () => {
      form.formItems.push({ field_name: '', field_type: 'text' });
    };

    const removeFormItem = (index) => {
      form.formItems.splice(index, 1);
    };
    const handleSubmit = async () => {
      v$.value.$touch();
      if (!v$.value.$invalid) {
        const token = localStorage.getItem('token');
        if (!token) {
          M.toast({ html: `Ви не авторизовані` });
          return;
        }

        try {
          const response = await apiService.createCustomForm(token, form.title, form.formType);
          createdFormId.value = response.data.data.id;
          M.toast({ html: `Назву форми успішно задано` });
        } catch (error) {
          console.error('Помилка при створенні форми:', error);
        }
      }
    };
    const submitFormItems = async () =>  {
      const token = localStorage.getItem('token');
      if (createdFormId.value && form.formItems.length) {
        try {
          await apiService.createFormItem(token, createdFormId.value, form.formItems);
          M.toast({ html: `Форма успішно створена` });
          router.push('/bank-info');
        } catch (error) {
          M.toast({ html: `Помилка під час створеня елементів форми` });
        }
      } else {
        M.toast({ html: `Форма не створена або елементи форми відсутні` });
      }
    };

    return {
      v$,
      form,
      addFormItem,
      removeFormItem,
      handleSubmit,
      submitFormItems,
      createdFormId
    };
  },
};
</script>
