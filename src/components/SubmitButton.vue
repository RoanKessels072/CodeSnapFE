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
  }
})

const emit = defineEmits(['submitted', 'error'])

const loading = ref(false)

const buttonText = computed(() => {
  return props.mode === 'rival'
    ? '⚔️Fight!⚔️'
    : 'Submit for grading'
})

async function submit() {
  loading.value = true;
  try {
    console.log('Submitting code:', props.code);
    const response = await api.post('/api/attempts/', {
      code: props.code,
      exerciseId: props.exerciseId
    });
    emit('submitted', response.data);
  } catch (err) {
    emit('error', err);
  } finally {
    loading.value = false;
  }
}
</script>
