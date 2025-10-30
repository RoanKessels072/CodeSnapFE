<template>
  <div id="app">
    <main>
      <div v-if="loading" class="text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="exercise">
        <div class="mb-3">
          <h4>{{ exercise.name }}</h4>
          <p>{{ exercise.description }}</p>
          <div class="d-flex gap-3 align-items-center">
            <span class="badge bg-secondary">{{ exercise.language }}</span>
            <div>
              <i
                v-for="n in 5"
                :key="n"
                :class="getFireIcon(n, exercise.difficulty)"
                class="me-1"
              ></i>
              <small class="text-muted">({{ exercise.difficulty }}/5)</small>
            </div>
          </div>
        </div>

        <CodeEditor :exercise="exercise" />
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import CodeEditor from '@/components/CodeEditor.vue';

export default {
  name: 'ExerciseSandbox',
  components: {
    CodeEditor
  },
  setup() {
    const route = useRoute();
    const exercise = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    onMounted(async () => {
      const exerciseId = route.params.id;

      try {
        const res = await fetch(`${API_BASE_URL}/api/exercises/${exerciseId}`);
        if (!res.ok) throw new Error('Failed to load exercise');
        exercise.value = await res.json();
      } catch (err) {
        console.error('Error loading exercise:', err);
        error.value = 'Failed to load exercise. Please try again.';
      } finally {
        loading.value = false;
      }
    });

    function getFireIcon(n, difficulty) {
      if (n <= difficulty) {
        return "bi bi-fire text-danger";
      }
      return "bi bi-fire text-muted opacity-25";
    }

    return {
      exercise,
      loading,
      error,
      getFireIcon
    };
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

header {
  background: #42b883;
  color: white;
  padding: 1rem;
}

main {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.bi-fire {
  font-size: 1.1rem;
}
</style>
