<template>
  <div :style="{ backgroundImage: `url(${fullBackgroundImageUrl})` }" class="background-navbar">
    <div class="navbar-title">PSY-CRM</div>
    <div class="container-user-photo">
      <router-link to="/profile">
        <div class="user-photo">
          <img :src="fullUserPhotoUrl" alt="user photo">
        </div>
        <span class="container-user-name">
          {{ userName }}
        </span>
      </router-link>
    </div>
  </div>
</template>
<script>
import apiService from '@/services/apiService';
import defaultUserPhoto from '@/assets/photo/Potted Plant.svg';
import headerWinter from '@/assets/photo/header-winter.webp';
import headerSpring from '@/assets/photo/header-spring.webp';
import headerSummer from '@/assets/photo/header-summer.webp';
import headerAutumn from '@/assets/photo/header-autumn.webp';

// фон шапки за замовчуванням змінюється з порою року (усі чотири — у кольорах CRM):
// грудень–лютий зима, березень–травень весна, червень–серпень літо, вересень–листопад осінь
const SEASON_HEADERS = [headerWinter, headerWinter, headerSpring, headerSpring, headerSpring, headerSummer,
  headerSummer, headerSummer, headerAutumn, headerAutumn, headerAutumn, headerWinter];
const defaultBackgroundImage = SEASON_HEADERS[new Date().getMonth()];
//import { mapState } from 'vuex';
export default {
  name: 'NavBar',
  data() {
    return {
      userPhoto: defaultUserPhoto,
      userName: '',
      backgroundImage: defaultBackgroundImage,
      baseImageUrl: 'https://assistant.psy-kokh.online',
    };
  },
  computed: {
    fullUserPhotoUrl() {
      // Відносний шлях із сервера доповнюємо адресою; картинку за замовчуванням (наш файл) — ні
      if (!this.userPhoto || this.userPhoto === defaultUserPhoto) return defaultUserPhoto;
      return this.userPhoto.startsWith('https') ? this.userPhoto : `${this.baseImageUrl}${this.userPhoto}`;
    },
    fullBackgroundImageUrl() {
      if (!this.backgroundImage || this.backgroundImage === defaultBackgroundImage) return defaultBackgroundImage;
      return this.backgroundImage.startsWith('https') ? this.backgroundImage : `${this.baseImageUrl}${this.backgroundImage}`;
    }
  },
  async mounted() {
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      if (token) {
        const userProfile = await apiService.getUserProfile(token);
        console.log(userProfile.data)
        if (userProfile && userProfile.data) {
          this.userName = userProfile.data.name || 'Username';
          this.userPhoto = userProfile.data.avatar_url || defaultUserPhoto;
          this.backgroundImage = userProfile.data.background_photo_url || defaultBackgroundImage;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },
}
</script>