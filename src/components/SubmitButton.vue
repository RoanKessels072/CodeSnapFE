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
import axios from 'axios'

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
  loading.value = true
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  try {
    let endpoint =
      props.mode === 'rival'
        ? '/api/grade/rival'
        : '/api/grade/assistant'

    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
      code: props.code,
      language: props.language,
      exerciseId: props.exerciseId
    })

    emit('submitted', response.data)
  } catch (err) {
    emit('error', err)
  } finally {
    loading.value = false
  }
}
</script>
