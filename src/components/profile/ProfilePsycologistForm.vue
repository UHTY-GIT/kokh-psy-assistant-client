<template>
  <div>
    <div class="update_profile_tittle">
      <p>
        Оновити дані профілю
      </p>
    </div>
    <div>
      <form class="name-update-form" @submit.prevent="submitUserProfile">
<!--        <div class="input-field">-->
<!--          <input-->
<!--              id="name"-->
<!--              type="text"-->
<!--              v-model.trim="name"-->
<!--              :class="{-->
<!--              invalid: v$.name.$dirty && v$.name.required.$invalid,-->
<!--              validate: v$.name.$dirty && !v$.name.required.$invalid-->
<!--            }"-->
<!--          >-->
<!--          <label for="name">Ім'я</label>-->
<!--          <small-->
<!--              class="helper-text invalid"-->
<!--              v-if="v$.name.$dirty && v$.name.required.$invalid"-->
<!--          >Введіть ваше ім'я</small>-->
<!--        </div>-->
        <!-- Поле для введення імені -->
        <div class="input-field-text">
          <div class="container-input">
            <label for="name">Введіть ім’я</label>
            <input
                id="name"
                type="text"
                v-model.trim="profile.name"
                :class="{ 'is-invalid': v$.profile.name.$dirty && v$.profile.name.required.$invalid }"
                placeholder="Введіть ваше повне ім'я"
            >
          </div>
          <span class="validate-error" v-if="v$.profile.name.$dirty && v$.profile.name.required.$invalid">Це поле не може бути пустим</span>
        </div>

        <!-- Поля для завантаження файлів -->
        <div class="file-upload-field">
          <div class="container-input">
            <label>Встановити аватар</label>
            <input
                type="file"
                ref="fileInputAvatar"
                @change="handleFileUpload($event, 'avatar')"
                style="display: none;"
            >
            <span class="file-chosen" @click="triggerFileInputAvatar">{{ fileNameAvatar ? fileNameAvatar : "Натисніть щоб вибрати файл" }}</span>
          </div>
        </div>

        <div class="file-upload-field">
          <div class="container-input">
            <label>Встановити зображення</label>
            <input
                type="file"
                ref="fileInputBackPhoto"
                @change="handleFileUpload($event, 'image')"
            >
            <span class="file-chosen" @click="triggerFileInputBackPhoto">{{ fileNameImage ? fileNameImage : "Натисніть щоб вибрати файл" }}</span>
          </div>
        </div>

        <div class="select-field">
          <div class="container-input">
            <label for="timezone">Встановити тайм-зону</label>
            <select id="timezone" v-model="profile.timezone">
              <option v-for="zone in timezones" :key="zone" :value="zone">{{ zone }}</option>
            </select>
          </div>
        </div>

        <!-- Поле для вибору дати -->
        <div class="date-field">
          <div class="container-input">
            <label for="birthdate">Дата народження</label>
            <input
                id="birthdate"
                type="date"
                v-model="profile.birthdate"
            >
          </div>
          <span class="validate-error" v-if="v$.profile.birthdate.$dirty && v$.profile.birthdate.required.$invalid">Це поле не може бути пустим</span>
        </div>

        <!-- Чекбокси для типу роботи -->
        <div class="checkbox-field">
          <div class="container-input">
            <label>Тип роботи</label>
            <div class="checkbox-group">
              <label class="custom-checkbox">
                <input type="checkbox" v-model="profile.workType" value="individual" />
                <span class="checkmark" @click="toggleWorkType('individual')">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Індивідуальна
                </p>
              </label>
              <label class="custom-checkbox">
                <input type="checkbox" v-model="profile.workType" value="couple"/>
                <span class="checkmark" @click="toggleWorkType('couple')">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Парна
                </p>
              </label>
              <label class="custom-checkbox">
                <input type="checkbox" v-model="profile.workType" value="family" />
                <span class="checkmark" @click="toggleWorkType('family')">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Сімейна
                </p>
              </label>
            </div>
          </div>
        </div>

        <!-- Текстове поле для кваліфікації -->
        <div class="input-field-text">
          <div class="container-input">
            <label for="qualification">Кваліфікація</label>
            <input
                id="qualification"
                type="text"
                v-model="profile.qualification"
                placeholder="Введіть вашу кваліфікацію"
            >
          </div>
          <span class="validate-error" v-if="v$.profile.qualification.$dirty && v$.profile.qualification.required.$invalid">Це поле не може бути пустим</span>
        </div>
        <div class="container-global-form-edit">
          <button class="global-form-edit" type="submit">
            <img src="@/assets/icons/edit-form.svg" alt="Edit Button">
            <span class="edit-link">Оновити</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { timezoneNames } from '@progress/kendo-date-math';
import '@progress/kendo-date-math/tz/all';

export default {
  setup() {
    const profile = ref({
      name: '',
      avatar: null,
      image: null,
      country: '',
      timezone: '',
      birthdate: '',
      workType: [],
      qualification: '',
    });
    const v$ = useVuelidate(); // Визначено тут для спрощення
    const fileInputAvatar = ref(null);
    const fileInputBackPhoto = ref(null);
    const timezones = ref([]);

    //Надсилання даних з форми на апі
    const submitUserProfile = () => {
      v$.value.$touch();
      if (!v$.value.$invalid) {
        console.log('Profile data:', profile.value);
        // Тут може бути логіка для відправки даних на сервер
      }
      const formData = {
        // name: name.value // Додайте ім'я користувача в дані форми
      };
      console.log(formData);
    }
    // Створюємо дві реф-змінні для назв файлів
    const fileNameAvatar = ref("Натисніть щоб вибрати файл");
    const fileNameImage = ref("Натисніть щоб вибрати файл");

    // Завантаження файлів з компютера (відображення необхідних полів у прелодері)
    const handleFileUpload = (event, field) => {
      if (event.target.files.length > 0) {
        profile.value[field] = event.target.files[0];

        // Оновлюємо назву файлу залежно від поля
        if(field === 'avatar') {
          fileNameAvatar.value = event.target.files[0].name;
        } else if(field === 'image') {
          fileNameImage.value = event.target.files[0].name;
        }
      } else {
        console.error('Файл не був вибраний');
      }
    }
    const triggerFileInputAvatar = () => {
      fileInputAvatar.value.click(); // Використовуємо реф для активації кліку на input
    }
    const triggerFileInputBackPhoto = () => {
      fileInputBackPhoto.value.click(); // Використовуємо реф для активації кліку на input
    }

    // Функція для перемикання типу роботи
    const toggleWorkType = (value) => {
      const index = profile.value.workType.indexOf(value);
      if (index === -1) {
        // Якщо значення не знайдено у масиві, додаємо його
        profile.value.workType.push(value);
      } else {
        // Якщо значення знайдено, видаляємо його
        profile.value.workType.splice(index, 1);
      }
    };

    // Завантажуємо часові пояси і налаштовуємо метод натискання
    onMounted(() => {
      timezones.value = timezoneNames()
          .filter(zone => zone.includes('/'))
          .sort((a, b) => a.localeCompare(b));

      // часовий пояс за умовчанням
      profile.value.timezone = timezones.value.includes(profile.value.timezone)
          ? profile.value.timezone
          : 'Europe/Kyiv'; // дефолтна тайм-зона
    });

    return {
      profile,
      v$,
      submitUserProfile,
      handleFileUpload,
      fileNameAvatar,
      fileNameImage,
      fileInputAvatar,
      fileInputBackPhoto,
      triggerFileInputAvatar,
      triggerFileInputBackPhoto,
      timezones,
      toggleWorkType,
    };
  },
  validations() {
    return {
      profile: { // Тепер використовуємо profile як реактивне джерело для валідацій
        name: {required},
        avatar: {required},
        image: {required},
        country: {required},
        timezone: {required},
        birthdate: {required},
        workType: {required},
        qualification: {required},
      }
    }
  }
}
</script>