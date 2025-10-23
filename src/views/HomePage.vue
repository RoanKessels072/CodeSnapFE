<script setup>
import HomeNavbar from '@/components/HomeNavbar.vue';
</script>

<template>
  <div>
    <HomeNavbar />
    <div class="container mt-5">
      <div class="text-center">
        <h1>Welcome to CodeSnap!</h1>
        <p class="lead">
          This is a placeholder homepage. Navigate using the menu above.
        </p>
        <router-link to="/exercises" class="btn btn-primary mt-3">
          View Exercises
        </router-link>
      </div>
    </div>
  </div>
</template>


<style scoped>
h1 {
  font-weight: 700;
}

p.lead {
  font-size: 1.25rem;
  color: #555;
}
</style>
