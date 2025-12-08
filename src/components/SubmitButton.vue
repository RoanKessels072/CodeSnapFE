<template>
  <button
    class="btn btn-primary"
    :disabled="loading"
    @click="submit"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
    {{ loading ? 'Submitting...' : buttonText }}
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api';

const props = defineProps({
  mode: {
    type: String,
    default: 'assistant'
  },
  code: {
    type: String,
    required: true
  },
  exerciseId: {
    type: [String, Number],
    required: true
  },
  language: {
    type: String,
    default: 'python'
  },
  difficulty: {
    type: String,
    default: 'medium'
  },
  exercise: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submitted', 'error'])

const loading = ref(false)

const buttonText = computed(() => {
  return props.mode === 'rival'
    ? '⚔️ Fight! ⚔️'
    : 'Submit for grading'
})

async function submit() {
  loading.value = true;

  try {
    if (props.mode === 'rival') {
      await submitRivalMode();
    } else {
      await submitAssistantMode();
    }
  } catch (err) {
    console.error('SubmitButton: Error during submission:', err);
    emit('error', err);
  } finally {
    loading.value = false;
  }
}

async function submitAssistantMode() {
  const response = await api.post('/attempts/', {
    code: props.code,
    exercise_id: props.exerciseId
  });

  emit('submitted', response.data);
}

async function submitRivalMode() {
  const response = await api.post('/ai/rival', {
    exercise_id: props.exerciseId,
    exercise_name: props.exercise?.name || 'Unknown Exercise',
    exercise_description: props.exercise?.description || '',
    language: props.language,
    difficulty: props.difficulty,

    starter_code: props.exercise?.starter_code || '',

    function_name: props.exercise?.function_name,
    test_cases: props.exercise?.test_cases || []
  });

  emit('submitted', response.data);
}
</script>
