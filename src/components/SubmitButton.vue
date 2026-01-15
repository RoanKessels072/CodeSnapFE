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
    console.log("Submitting", props.mode);
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
  let response = await api.post('/attempts/', {
    code: props.code,
    exercise_id: props.exerciseId
  });

  if (response.data?.status === 'pending') {
    response = await pollStatus(() => api.get(`/attempts/${response.data.id}`));
  }

  emit('submitted', response.data);
}

async function submitRivalMode() {
  console.log("Submitting rival mode");
  const response = await api.post('/ai/rival', {
    exercise_id: props.exerciseId,
    exercise_name: props.exercise?.name || 'Unknown Exercise',
    exercise_description: props.exercise?.description || '',
    language: props.language,
    difficulty: props.difficulty,
    code: props.code,

    starter_code: props.exercise?.starter_code || '',

    function_name: props.exercise?.function_name,
    test_cases: props.exercise?.test_cases || []
  });

  let userAttempt = response.data.user_attempt;
  const aiRival = response.data.ai_rival;
  console.log("AI Rival", aiRival);
  if (!userAttempt) {
    console.error('Missing user_attempt in response:', response.data);
    throw new Error('Invalid response: missing user_attempt');
  }

  if (userAttempt.status === 'pending') {
    const pollResponse = await pollStatus(() => api.get(`/attempts/${userAttempt.id}`));
    userAttempt = pollResponse.data;
  }

  emit('submitted', {
    user_result: userAttempt,
    ai_result: aiRival
  });
}

async function pollStatus(apiCall) {
  const pollInterval = 1000;

  while (true) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    const response = await apiCall();

    if (response.data.status === 'completed') {
      return response;
    }

    if (response.data.status === 'failed' || response.data.status === 'error') {
      throw new Error(response.data.error || 'Grading failed');
    }
  }
}
</script>
