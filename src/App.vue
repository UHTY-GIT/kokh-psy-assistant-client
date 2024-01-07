<template>
  <div id="app">
    <component :is="layout">
      <router-view/>
    </component>
  </div>
</template>

<script>
import LoginLayout from "@/layouts/LoginLayout.vue";
import MainLayout from "@/layouts/MainLayout.vue";
export default {
  computed: {
    layout() {
      console.log(this.$route.meta)
      return (this.$route.meta.layout || 'empty') + '-layout';
    }
  },
  components: {
    LoginLayout, MainLayout
  }
}
</script>

<style>
@import "materialize-css/dist/css/materialize.min.css";
@import "assets/style.scss";
</style>
