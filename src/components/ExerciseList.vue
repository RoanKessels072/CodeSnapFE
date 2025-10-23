<template>
  <div class="row g-4">
    <div
      v-for="exercise in exercises"
      :key="exercise.id"
      class="col-12 col-md-6 col-lg-4"
    >
    <router-link
        :to="{ name: 'ExerciseSandbox', params: { id: exercise.id } }"
        class="text-decoration-none"
      >
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2">{{ exercise.name }}</h5>
          <p class="card-text flex-grow-1">{{ exercise.description }}</p>

          <div class="mb-2">
            <i
              v-for="n in 5"
              :key="n"
              :class="getFireIcon(n, exercise.difficulty)"
              class="me-1"
            ></i>
            <small class="text-muted ms-1">({{ exercise.difficulty }}/5)</small>
          </div>

          <span class="badge bg-secondary align-self-start">
            {{ exercise.language }}
          </span>
        </div>
      </div>
      </router-link>
    </div>

    <div v-if="!exercises.length" class="text-center text-muted mt-5">
      No exercises found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const exercises = ref([]);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/exercises`);
    if (!res.ok) throw new Error("Failed to load exercises");
    exercises.value = await res.json();
    console.log("Loaded exercises:", exercises.value);
  } catch (err) {
    console.error("Error fetching exercises:", err);
  }
});

function getFireIcon(n, difficulty) {
  if (n <= difficulty) {
    return "bi bi-fire text-danger";
  }
  return "bi bi-fire text-muted opacity-25";
}
</script>

<style scoped>
.card {
  border-radius: 1rem;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}

.card-title {
  font-weight: 600;
}

.bi-fire {
  font-size: 1.1rem;
}
</style>
