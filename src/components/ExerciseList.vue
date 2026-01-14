<template>
  <div class="container mt-4">
    <h2 class="mb-4">Available Exercises</h2>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="row g-4">
      <div
        v-for="exercise in exercises"
        :key="exercise.id"
        class="col-md-6 col-lg-4"
      >
        <div
          class="card h-100 shadow-sm exercise-card"
          @click="openModeModal(exercise)"
        >
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ exercise.name }}</h5>
            <p class="card-text text-muted flex-grow-1">{{ exercise.description }}</p>

            <div class="mb-3">
              <span class="badge bg-secondary me-2">{{ exercise.language }}</span>
              <div class="d-inline-block">
                <i
                  v-for="n in 5"
                  :key="n"
                  :class="getFireIcon(n, exercise.difficulty)"
                  class="me-1"
                ></i>
                <small class="text-muted">({{ exercise.difficulty }}/5)</small>
              </div>
            </div>

            <div v-if="getBestAttempt(exercise.id)" class="alert alert-info py-2 mb-0 mt-auto">
              <small class="d-block mb-1"><strong>Your Best:</strong></small>
              <div class="d-flex align-items-center gap-2">
                <div>
                  <i
                    v-for="n in 3"
                    :key="n"
                    :class="n <= getBestAttempt(exercise.id).stars ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"
                  ></i>
                </div>
                <small class="text-muted">Score: {{ getBestAttempt(exercise.id).score }}/100</small>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div v-if="!exercises.length" class="text-center text-muted mt-5">
        No exercises found.
      </div>
    </div>

    <ModeModal ref="modeModal" @select-mode="startExercise" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from '../api';
import ModeModal from "@/components/ModeModal.vue";

const router = useRouter();
const exercises = ref([]);
const bestAttempts = ref({});
const loading = ref(true);

const selectedExercise = ref(null);
const modeModal = ref(null);

onMounted(async () => {
  try {
    const exercisesRes = await api.get('/exercises/');
    exercises.value = exercisesRes.data;

    try {
      const attemptsRes = await api.get('/attempts/best');
      bestAttempts.value = attemptsRes.data;
    } catch (err) {
      console.warn("No best attempts yet or error fetching:", err);
      bestAttempts.value = {};
    }

  } catch (err) {
    console.error("Error fetching exercises:", err);
  } finally {
    loading.value = false;
  }
});

function getBestAttempt(exerciseId) {
  return bestAttempts.value[exerciseId] || null;
}

function openModeModal(exercise) {
  selectedExercise.value = exercise;
  modeModal.value.show();
}

function startExercise(modeData) {
  if (!selectedExercise.value) return;

  const query = {
    mode: modeData.mode,
    ...(modeData.difficulty && { difficulty: modeData.difficulty })
  };

  router.push({
    name: "ExerciseSandbox",
    params: { id: selectedExercise.value.id },
    query: query,
  });

  selectedExercise.value = null;
}

function getFireIcon(n, difficulty) {
  if (n <= difficulty) {
    return "bi bi-fire text-danger";
  }
  return "bi bi-fire text-muted opacity-25";
}
</script>

<style scoped>
/* Combined Styles */
.exercise-card {
  cursor: pointer;
  border-radius: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.exercise-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  font-weight: 600;
}

.bi-fire {
  font-size: 1.1rem;
}

.bi-star, .bi-star-fill {
  font-size: 0.9rem;
}
</style>
