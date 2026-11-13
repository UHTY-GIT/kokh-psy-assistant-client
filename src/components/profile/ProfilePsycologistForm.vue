<template>
  <div>
    <div class="update_profile_tittle">
      <p>
        Оновити дані профілю
      </p>
    </div>
    <div>
      <form class="name-update-form fields-grid" @submit.prevent="submitUserProfile">
        <!-- Поле для введення імені -->
        <div class="input-field-text">
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label for="name">Введіть ім’я</label>
            </div>
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

        <!-- Поля для завантаження файлів: клік або перетягування файлу -->
        <div class="file-upload-field">
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label>Встановити аватар</label>
            </div>
            <FileDrop :name="fileNameAvatar" target="аватар" accept="image/*" @file="setFile('avatar', $event)" />
          </div>
        </div>

        <div class="file-upload-field">
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label>Встановити зображення</label>
            </div>
            <FileDrop :name="fileNameImage" target="зображення" accept="image/*" @file="setFile('background_photo', $event)" />
          </div>
        </div>

        <div class="select-field">
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label for="timezone">Встановити тайм-зону</label>
            </div>
            <BaseSelect id="timezone" v-model="profile.timezone">
              <option v-for="zone in timezones" :key="zone" :value="zone">{{ zone }}</option>
            </BaseSelect>
          </div>
        </div>

        <!-- Поле для вибору дати -->
        <div class="date-field">
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label for="birthdate">Дата народження</label>
            </div>
            <DatePicker
                id="birthdate"
                v-model="profile.birthdate"
                min="1900-01-01"
                :max="todayIso"
                :invalid="v$.profile.birthdate.$dirty && v$.profile.birthdate.required.$invalid"
            />
          </div>
          <span class="validate-error" v-if="v$.profile.birthdate.$dirty && v$.profile.birthdate.required.$invalid">Це поле не може бути пустим</span>
        </div>

        <!-- Чекбокси для типу роботи -->
        <div class="checkbox-field">
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label>Тип роботи</label>
            </div>
            <div class="checkbox-group">
              <label class="custom-checkbox">
                <input type="checkbox" v-model="profile.workType" value="individual" />
                <span class="checkmark">
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
                <span class="checkmark">
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
                <span class="checkmark">
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
          <div class="container-input user-profile">
            <div class="type-for-view">
              <label for="qualification">Кваліфікація</label>
            </div>
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
            <IconRefresh class="btn-icon" />
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
import apiService from "@/services/apiService";
import DatePicker from "@/components/ui/DatePicker.vue";
import FileDrop from "@/components/ui/FileDrop.vue";

export default {
  components: {
    DatePicker,
    FileDrop
  },
  setup() {
    const profile = ref({
      name: '',
      avatar: null,
      background_photo: null,
      country: '',
      timezone: '',
      birthdate: '',
      workType: [],
      qualification: '',
    });
    const v$ = useVuelidate(); // Визначено тут для спрощення
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timezones = ref([]);


    // Отримую дані профілю користувача та заповніть форму
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userProfile = await apiService.getUserProfile(token);
        console.log(userProfile.data)
        profile.value = {
          name: userProfile.data.name,
          avatar: userProfile.data.avatar_url,
          background_photo: userProfile.data.background_photo_url,
          country: userProfile.data.country,
          timezone: userProfile.data.timezone,
          birthdate: userProfile.data.birth_date,
          workType: [], // Assuming this needs to be mapped from userProfile
          qualification: userProfile.data.qualification,
        };
        fileNameAvatar.value = userProfile.avatar_url ? userProfile.avatar_url.split('/').pop() : "Натисніть щоб вибрати файл";
        fileNameImage.value = userProfile.background_photo_url ? userProfile.background_photo_url.split('/').pop() : "Натисніть щоб вибрати файл";
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

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

    // Файл вибрали або перетягнули в поле — зберігаємо його й показуємо назву
    const setFile = (field, file) => {
      profile.value[field] = file;
      if (field === 'avatar') {
        fileNameAvatar.value = file.name;
      } else if (field === 'background_photo') {
        fileNameImage.value = file.name;
      }
    }

    // Завантажуємо часові пояси і налаштовуємо метод натискання
    onMounted(async () => {
      timezones.value = timezoneNames()
          .filter(zone => zone.includes('/'))
          .sort((a, b) => a.localeCompare(b));

      console.log(timezones.value)

      await fetchUserProfile();

      // часовий пояс за умовчанням
      profile.value.timezone = timezones.value.includes(profile.value.timezone)
          ? profile.value.timezone
          : 'Europe/Kyiv'; // дефолтна тайм-зона
    });

    return {
      profile,
      v$,
      submitUserProfile,
      setFile,
      fileNameAvatar,
      fileNameImage,
      timezones,
      todayIso,
    };
  },
  validations() {
    return {
      profile: { // Тепер використовуємо profile як реактивне джерело для валідацій
        name: {required},
        avatar: {},
        background_photo: {},
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