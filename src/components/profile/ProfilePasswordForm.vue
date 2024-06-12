<!--src/components/modal/ProfilePasswordForm.vue-->
<template>
  <div>
    <div class="update_profile_tittle">
      <p>
        Змінити пароль
      </p>
    </div>
    <div>
      <form class="password-update-form" @submit.prevent="submitUserPassword">
        <div class="input-field-text">
          <div class="container-input">
            <label for="old-password">Старий пароль</label>
            <input
                id="old-password"
                :type="isOldPasswordVisible ? 'text' : 'password'"
                v-model.trim="password"
                placeholder="Введіть старий пароль"
            >
            <i class="change-password user-page-password" :class="OldPasswordIconClass" @click="OldTogglePassword"></i>
          </div>
          <span
              class="validate-error"
              v-if="v$.password.$dirty && v$.password.required.$invalid"
          >Введіть старий пароль</span>
        </div>

        <div class="input-field-text">
          <div class="container-input">
            <label for="new-password">Новий пароль</label>
            <input
                id="new-password"
                :type="isNewPasswordVisible ? 'text' : 'password'"
                v-model.trim="newPassword"
                placeholder="Введіть новий пароль"
            >
            <i class="change-password user-page-password" :class="NewPasswordIconClass" @click="NewTogglePassword"></i>
          </div>
          <span
              class="validate-error"
              v-if="v$.newPassword.$dirty && v$.newPassword.required.$invalid"
          >Введіть новий пароль</span>
          <span
              class="validate-error"
              v-else-if="v$.newPassword.$dirty && v$.newPassword.minLength.$invalid"
          >Новий пароль повинен бути мінімум {{ v$.newPassword.minLength.$params.min }} символів. Зараз він {{ newPassword.length }}</span>
        </div>

        <div class="input-field-text">
          <div class="container-input">
            <label for="confirm-new-password">Підтвердіть новий пароль</label>
            <input
                id="confirm-new-password"
                :type="isNewPasswordVisible ? 'text' : 'password'"
                v-model.trim="confirmNewPassword"
                placeholder="Підтвердіть новий пароль"
            >
            <i class="change-password user-page-password" :class="NewPasswordIconClass" @click="NewTogglePassword"></i>
          </div>
          <span
              class="validate-error"
              v-if="v$.confirmNewPassword.$dirty && v$.confirmNewPassword.required.$invalid"
          >Підтвердіть новий пароль</span>
          <span
              class="validate-error"
              v-else-if="v$.confirmNewPassword.$dirty && v$.confirmNewPassword.minLength.$invalid"
          >Новий пароль повинен бути мінімум {{ v$.confirmNewPassword.minLength.$params.min }} символів. Зараз він {{ confirmNewPassword.length }}</span>
          <span
              class="validate-error"
              v-else-if="v$.confirmNewPassword.$dirty && confirmNewPassword !== newPassword"
          >Паролі не співпадають</span>
        </div>
        <div class="container-global-form-edit">
          <button class="password-form-edit" type="submit">
            <img src="@/assets/icons/edit-form.svg" alt="Edit Button">
            <span class="edit-link">Змінити пароль</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import useVuelidate from '@vuelidate/core';
import { required, minLength } from "@vuelidate/validators";
import M from "materialize-css";
import apiService from '@/services/apiService';
import { useRouter } from "vue-router";

export default {
  setup () {
    const password = ref('');
    const newPassword = ref('');
    const confirmNewPassword = ref('');

    const v$ = useVuelidate();
    const router = useRouter();

    // Відправка форми по зміні паролю
    const submitUserPassword = async () => {
      v$.value.$touch();
      if (v$.value.$invalid || newPassword.value !== confirmNewPassword.value) {
        console.log("Validation failed or passwords do not match");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Токен не знайдений. Перенаправлення на сторінку входу.");
        router.push('/login');
        return;
      }

      try {
        const response = await apiService.changePassword(token, password.value, newPassword.value, confirmNewPassword.value);
        M.toast({ html: `Пароль успішно змінено` });
        console.log('Пароль успішно змінено:', response);
        // Очищення поля вводу
        password.value = '';
        newPassword.value = '';
        confirmNewPassword.value = '';
      } catch (error) {
        M.toast({ html: `[Помилка]: Пароль змінити не вдалося` });
        console.log('Помилка при зміні паролю:', error);
      }
    }

    // Реактивний стан для перевірки видимості старого пароля
    const isOldPasswordVisible = ref(false);
    const OldPasswordIconClass = ref('fas fa-eye-slash');

    // Функція переключення видимості пароля
    const OldTogglePassword = () => {
      isOldPasswordVisible.value = !isOldPasswordVisible.value;
      OldPasswordIconClass.value = isOldPasswordVisible.value ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    // Реактивний стан для перевірки видимості нового пароля
    const isNewPasswordVisible = ref(false);
    const NewPasswordIconClass = ref('fas fa-eye-slash');

    // Функція переключення видимості пароля
    const NewTogglePassword = () => {
      isNewPasswordVisible.value = !isNewPasswordVisible.value;
      NewPasswordIconClass.value = isNewPasswordVisible.value ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    return {
      v$,
      submitUserPassword,
      OldTogglePassword,
      NewTogglePassword,
      isOldPasswordVisible,
      isNewPasswordVisible,
      OldPasswordIconClass,
      NewPasswordIconClass,
      password,
      newPassword,
      confirmNewPassword,
    }
  },
  validations () {
    return {
      password: { required },
      newPassword: { required, minLength: minLength(6) },
      confirmNewPassword: { required, minLength: minLength(6) }
    }
  },
}
</script>
