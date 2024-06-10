<template>
  <section class="profile-section">
    <div>
      <div class="profile_tittle">
        <p>
          Мій профіль
        </p>
        <button @click.prevent="logout">
          <span class="edit-link">Вийти з аккаунту</span>
        </button>
      </div>
      <hr class="hr_profile">
    </div>
    <div class="profile_block">
      <!--    Форма для зміни даних психолога-->
      <ProfilePsycologistForm />
      <!--    Форма для зміни робочих днів-->
      <ProfileWorkDayForm />
      <!--    Форма для зміни паролю-->
      <ProfilePasswordForm />
    </div>
  </section>
</template>
<script>
//import apiService from '@/services/apiService.js';
import ProfilePsycologistForm from "@/components/profile/ProfilePsycologistForm.vue";
import ProfilePasswordForm from "@/components/profile/ProfilePasswordForm.vue";
import ProfileWorkDayForm from "@/components/profile/ProfileWorkDayForm.vue";
import M from "materialize-css";

export default {
  name: 'ProfileUser',
  components: {
    ProfilePsycologistForm,
    ProfilePasswordForm,
    ProfileWorkDayForm
  },
  methods: {
    //Виводимо ключ get запитом у url шоб вивнести повідомлення logout на екран на сторінці UserLogin
    async logout() {
      const token = localStorage.getItem('token');
      console.log("remove " + token);
      if (token) {
        //await apiService.logoutUser(token);
        localStorage.removeItem('token');  // Видаляємо токен з localStorage
        this.$router.push('/login?message=logout');
      } else {
        //console.log("Токен не знайдений. Перенаправлення на сторінку входу.");
        M.toast({ html: `Токен не знайдений. Перенаправлення на сторінку входу.` });
        this.$router.push({name: 'login'});
      }
    }
  },
}
</script>