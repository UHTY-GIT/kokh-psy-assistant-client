<template>
  <div :style="{ backgroundImage: `url(${fullBackgroundImageUrl})` }" class="background-navbar">
    <div class="navbar-title">PSY-CRM 🤍</div>
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
import defaultBackgroundImage from '@/assets/photo/back-users-1.png';
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
      // Якщо userPhoto не null і містить шлях, який не починається з 'http', додаємо baseImageUrl
      return this.userPhoto && !this.userPhoto.startsWith('https') ? `${this.baseImageUrl}${this.userPhoto}` : this.userPhoto;
    },
    fullBackgroundImageUrl() {
      // Якщо backgroundImage містить шлях, який не починається з 'http', додаємо baseImageUrl
      // В іншому випадку, повертаємо сам backgroundImage або defaultBackgroundImage, якщо перший null
      return this.backgroundImage && !this.backgroundImage.startsWith('https') ? `${this.baseImageUrl}${this.backgroundImage}` : (this.backgroundImage || defaultBackgroundImage);
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