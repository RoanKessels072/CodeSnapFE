<template>
  <div>
    <HomeNavbar />
  <div class="container my-5">
    <h2 class="mb-4 text-center">Exercise Overview</h2>
    <ExerciseList />
  </div>
  </div>
</template>

<script setup>
import ExerciseList from "@/components/ExerciseList.vue";
import HomeNavbar from '@/components/HomeNavbar.vue';
</script>
