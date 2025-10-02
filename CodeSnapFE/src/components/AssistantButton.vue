<template>
  <button @click="callAIAssistant" :disabled="loading" class="assistant-button">
    {{ loading ? 'Thinking...' : 'AI Assistant' }}
  </button>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AssistantButton',
  props: {
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async callAIAssistant() {
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:5000/api/ai-assistant', {
          code: this.code,
          language: this.language
        });
        this.$emit('ai-response', response.data);
      } catch (error) {
        console.error('Failed to call AI assistant:', error);
        this.$emit('ai-error', error.message);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.assistant-button {
  background: #646cff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.assistant-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
