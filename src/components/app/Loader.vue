<template>
  <div class="loader-container">
    <div class="preloader-wrapper big active">
      <div class="spinner-layer spinner-custom">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div><div class="gap-patch">
          <div class="circle"></div>
        </div><div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoaderComponent'
}
</script>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
}

.spinner-custom {
  border-color: #72A8BA;
}
</style>
