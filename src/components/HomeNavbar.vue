<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">CodeSnap</router-link>
      <div class="nav-item" v-if="state.authenticated">
        <span class="nav-link">Logged in as: {{ state.userProfile?.username }}</span>
      </div>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/exercises">Exercises</router-link>
          </li>
          <li class="nav-item" v-if="!state.authenticated">
            <button class="btn btn-outline-primary me-2" @click="handleRegister">
              Register
            </button>
          </li>
          <li class="nav-item" v-if="!state.authenticated">
            <button class="btn btn-outline-primary" @click="login()">
              Login
            </button>
          </li>
          <li class="nav-item" v-if="state.authenticated">
            <button class="btn btn-outline-danger" @click="handleLogout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { state, login, logout, register } from "../keycloak";

function handleLogout() {
  logout();
}

function handleRegister() {
  register();
}
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
}
</style>
