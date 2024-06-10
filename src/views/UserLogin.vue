<template>
  <div class="background-login">
    <div class="empty-layout">
      <div class="elipse_login_1"></div>
      <div class="elipse_login_2"></div>
      <form class="card auth-card" @submit.prevent="submitHandler">
        <div class="card-content">
          <span class="card-title">Psy Assistant</span>
          <div class="input-field">
            <!--            .trim видаляє лишні пробіли
                            $dirty валідація буде якщо користувач вже шось роби в у полі
            -->
            <input
                id="email"
                type="text"
                v-model.trim="email"
                :class="{
                  invalid: (v$.email.$dirty && v$.email.required.$invalid) || (v$.email.$dirty && v$.email.email.$invalid),
                  validate: v$.email.$dirty && !v$.email.required.$invalid && !v$.email.email.$invalid
                }"
            >
            <label for="email">E-mail</label>
            <small
                class="helper-text invalid"
                v-if="v$.email.$dirty && v$.email.required.$invalid"
            >Поле E-mail не може бути пустим</small>
            <small
                class="helper-text invalid"
                v-else-if="v$.email.$dirty && v$.email.email.$invalid"
            >Введіть коректний E-mail</small>
          </div>
          <div class="input-field">
            <input
                id="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                v-model.trim="password"
                :class="{
                  invalid: (v$.password.$dirty && v$.password.required.$invalid) || (v$.password.$dirty && !v$.password.minLength.$invalid),
                  validate: v$.password.$dirty && !v$.password.required.$invalid && !v$.password.minLength.$invalid
                }"
            >
            <label for="password">Пароль</label>
            <small
                class="helper-text invalid"
                v-if="v$.password.$dirty && v$.password.required.$invalid"
            >Введіть пароль</small>
            <small
                class="helper-text invalid"
                v-else-if="v$.password.$dirty && v$.password.minLength.$invalid"
            >Пароль повинен бути {{ v$.password.minLength.$params.min }} символів. Зараз він {{password.length}}</small>
            <i class="toggle-password" :class="passwordIconClass" @click="togglePassword"></i>
          </div>
        </div>
        <div class="card-action">
          <div class="butt_login">
            <button
                class="btn auth-submit"
                type="submit"
            >
              Увійти
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import {useRouter} from "vue-router";
import messages from "@/utils/messages";
import apiService from '@/services/apiService';
import M from 'materialize-css';

export default {
  name: 'loginPage',
  setup () {
    const token = localStorage.removeItem('token');
    console.log("token now " + token);

    const email = ref('');
    const password = ref('');
    const router = useRouter(); // Переміщено сюди з submitHandler
    const v$ = useVuelidate(); // Визначено тут для спрощення
    const submitHandler = async () => {
      if (v$.value.$invalid) {
        v$.value.$touch();
        console.log("click to submitHandler")
        return;
      }

      try {
        const response = await apiService.loginUser(email.value, password.value);
        console.log(response.data.token);
        // Додати перевірку на наявність response.data і response.data.data перед доступом до token
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          router.push('/');
        }
      } catch (error) {
        console.error("Помилка під час спроби входу:", error);

        if (error.response && error.response.status === 409) {
          // Перевіряємо, чи помилка містить конкретне повідомлення
          const isIncorrectCredentials = error.response.data.error.some(
              (err) => err.message === "email or password is incorrect"
          );

          if (isIncorrectCredentials) {
            // Виводимо повідомлення про невірний логін або пароль
            M.toast({html: 'Введено невірно логін або пароль'});
          } else {
            // Виводимо повідомлення про інші помилки, які можуть бути у відповіді
            error.response.data.error.forEach((err) => {
              M.toast({html: `[Помилка]: ${err.message || "Невідома помилка"}`});
            });
          }
        } else {
          // Виводимо інші помилки, які не стосуються відповіді API
          M.toast({html: `[Помилка]: ${error.message || "Невідома помилка"}`});
        }
      }
    }

    // Реактивний стан для перевірки видимості пароля
    const isPasswordVisible = ref(false);

    const passwordIconClass = ref('fas fa-eye-slash'); // Додано реактивний об'єкт для зміни іконки

    // Функція переключення видимості пароля
    const togglePassword = () => {
      isPasswordVisible.value = !isPasswordVisible.value;
      if (isPasswordVisible.value) {
        passwordIconClass.value = 'fas fa-eye';
      } else {
        passwordIconClass.value = 'fas fa-eye-slash';
      }
    }

    return {
      v$,
      submitHandler, // Повертаємо функцію з setup
      isPasswordVisible,
      togglePassword,
      passwordIconClass,
      email,
      password,
    }
  },
  validations () {
    return {
      email: { required, email },
      password: { required, minLength: minLength(6) } // припустимо, мінімальна довжина пароля - 6 символів
    }
  },
  mounted() {
    //повідомлення про вихід з системи переться по ключу з get запиту
    if (messages[this.$route.query.message]) {
      this.$message(messages[this.$route.query.message])
    }
  }
}

</script>