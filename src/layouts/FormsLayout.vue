<!--src/layouts/FormsLayout.vue-->
<template>
  <div class="background_main">
    <NavBarForms />
    <section class="section-forms">
      <router-view />
    </section>
  </div>
</template>
<script>
import NavBarForms from "@/components/app/NavBarForms.vue";
export default {
  name: 'forms-layout',
  components: {
    NavBarForms
  },
  methods: {
  }
}
</script>