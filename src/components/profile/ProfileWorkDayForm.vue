<template>
  <div>
    <div class="update_profile_tittle">
      <p>
        Обрати робочі дні
      </p>
    </div>
    <div>
      <form class="day-update-form" @submit.prevent="submitDaysProfile">
        <!-- Чекбокси для днів роботи -->
        <div class="checkbox-field">
          <div class="container-input">
            <label>Робочі дні</label>
            <div class="checkbox-group">
              <label class="custom-checkbox">
                <input
                    type="checkbox"
                    v-model="workingDays.monday"
                />
                <span class="checkmark">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Пн
                </p>
              </label>
              <label class="custom-checkbox">
                <input
                    type="checkbox"
                    v-model="workingDays.tuesday"
                />
                <span class="checkmark">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Вт
                </p>
              </label>
              <label class="custom-checkbox">
                <input
                    type="checkbox"
                    v-model="workingDays.wednesday"
                />
                <span class="checkmark">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Ср
                </p>
              </label>
              <label class="custom-checkbox">
                <input
                    type="checkbox"
                    v-model="workingDays.thursday"
                />
                <span class="checkmark">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Чт
                </p>
              </label>
              <label class="custom-checkbox">
                <input
                    type="checkbox"
                    v-model="workingDays.friday"
                />
                <span class="checkmark">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Пт
                </p>
              </label>
              <label class="custom-checkbox">
                <input
                    type="checkbox"
                    v-model="workingDays.saturday"
                />
                <span class="checkmark">
                  <svg class="svg-checkmark" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                    <path class="checkmark-path" d="M5.83301 18.9585L13.1247 26.2502L29.1663 10.2085" stroke="white" stroke-width="3" stroke-linecap="round" stroke-dasharray="32.99833297729492" stroke-dashoffset="32.99833297729492"/>
                  </svg>
                </span>
                <p>
                  Сб
                </p>
              </label>
            </div>
          </div>
          <!-- Відображення повідомлення про помилку -->
          <span
              v-if="v$.workingDays.$error"
              class="validate-error"
          >
            Будь ласка, виберіть хоча б один робочий день.
          </span>
        </div>
        <div class="container-global-form-edit">
          <button class="global-form-edit" type="submit">
            <img src="@/assets/icons/edit-form.svg" alt="Edit Button">
            <span class="edit-link">Вибрати</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
//import { required } from "@vuelidate/validators";
export default {
  setup() {
    // Ініціалізація стану форми
    const workingDays = ref({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    });

    // Кастомний валідатор
    const atLeastOneDaySelected = (value) => {
      return Object.values(value).some(v => v);
    };

    const v$ = useVuelidate({
      workingDays: { atLeastOneDaySelected }
    }, { workingDays });
    const submitDaysProfile = () => {
      v$.value.$touch();
      if (!v$.value.$invalid) {
        console.log('Обрані робочі дні:', Object.keys(workingDays.value).filter(day => workingDays.value[day]));
        // Логіка відправки даних на сервер
      } else {
        // Логіка для обробки помилки валідації
      }
    };

    return {
      v$,
      workingDays,
      submitDaysProfile,
    }
  },
}

</script>