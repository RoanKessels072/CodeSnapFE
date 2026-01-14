<template>
  <div class="home-page">
    <div class="hero-section text-center p-5">
      <h1 class="display-4 fw-bold mb-4">Master Coding with CodeSnap</h1>
      <p class="lead mb-4">
        Interactive coding challenges, instant feedback, and AI-powered learning.
        Level up your skills with our curated exercises.
      </p>
      <div v-if="!isAuthenticated" class="cta-buttons">
        <button @click="handleRegister" class="btn btn-primary btn-lg me-3">Get Started</button>
        <button @click="handleLogin" class="btn btn-outline-secondary btn-lg">Login</button>
      </div>
      <div v-else>
        <router-link to="/exercises" class="btn btn-success btn-lg">
          Go to Exercises
        </router-link>
      </div>
    </div>

    <div class="features-section container py-5">
      <div class="row g-4">
        <div class="col-md-4 text-center">
          <div class="feature-icon mb-3">
            <i class="bi bi-code-square fs-1 text-primary"></i>
          </div>
          <h3>Practice</h3>
          <p>Solve a variety of coding problems in Python (and more coming soon) directly in your browser.</p>
        </div>
        <div class="col-md-4 text-center">
          <div class="feature-icon mb-3">
            <i class="bi bi-lightning-charge fs-1 text-warning"></i>
          </div>
          <h3>Instant Feedback</h3>
          <p>Run your code against test cases and get immediate results to improve your solutions.</p>
        </div>
        <div class="col-md-4 text-center">
          <div class="feature-icon mb-3">
            <i class="bi bi-robot fs-1 text-success"></i>
          </div>
          <h3>AI Assistant</h3>
          <p>Stuck? Get hints and guidance from our integrated AI assistant to help you learn.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state, login, register } from "../keycloak";

const isAuthenticated = computed(() => state.authenticated);

function handleLogin() {
  login();
}

function handleRegister() {
  register();
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 0 0 50% 50% / 4%;
  padding-bottom: 6rem !important;
}

.feature-icon {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
