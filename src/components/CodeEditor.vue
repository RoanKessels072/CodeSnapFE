<script setup>
  import SubmitButton from './SubmitButton.vue'
</script>

<template>
  <div class="code-editor">
    <div
      v-if="showErrorPopup"
      class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3"
      role="alert"
      style="z-index: 1050;"
    >
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="showErrorPopup = false"></button>
    </div>

    <div class="toolbar bg-light p-2 mb-3 rounded d-flex gap-2">
      <button @click="executeCode" :disabled="loading" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ loading ? 'Running...' : 'Run Code' }}
      </button>
      <AssistantButton
        v-if="mode === 'assistant'"
        :code="code"
        :language="language"
        :exercise="exercise"
        @ai-response="handleAIResponse"
        @ai-error="handleAIError"
      />
      <SubmitButton
        :mode="mode"
        :code="code"
        :language="language"
        :exercise-id="exercise.id"
        @submitted="handleSubmission"
        @error="handleSubmissionError"
      />
    </div>

    <div class="editor-container">

      <div class="editor border rounded">
        <VueMonacoEditor
          v-model:value="code"
          :language="language"
          :options="editorOptions"
        />
      </div>

      <div class="output border rounded bg-light p-3">
        <h5>Output:</h5>
        <pre class="mb-0">{{ output }}</pre>
        <div v-if="error" class="alert alert-danger mt-3">
          <h6>Error:</h6>
          <pre class="mb-0">{{ error }}</pre>
        </div>
      </div>

  <div
  v-if="mode === 'assistant'"
  class="d-flex align-items-stretch">
  <button
    class="btn btn-primary btn-sm toggle-btn"
    type="button"
    @click="toggleAIPanel"
  >
        {{ aiPanelOpen ? 'Close' : 'Open' }}
  </button>

  <div class="collapse collapse-horizontal show" id="aiPanel">
    <div class="card card-body ai-panel-card">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">AI Suggestions</h5>
        <button
          @click="applyAISuggestions"
          :disabled="!aiResponse"
          class="btn btn-sm btn-success"
        >
          Apply
        </button>
      </div>
      <div class="ai-content">
        <pre class="mb-0">
          {{ aiResponse || 'No AI suggestions yet. Click the AI Assistant button to get help.' }}
        </pre>
      </div>
    </div>
  </div>
</div>
</div>
  </div>
</template>

<script>
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import api from '../api';
import AssistantButton from './AssistantButton.vue';
import { useRoute } from 'vue-router'
import { Collapse } from 'bootstrap'

export default {
  name: 'CodeEditor',
  components: { VueMonacoEditor, AssistantButton},
  props: {
    exercise: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      code: '',
      language: 'python',
      output: '',
      error: '',
      loading: false,
      aiResponse: '',
      aiPanelOpen: true,
      bsCollapse: null,
      showErrorPopup: false,
      errorMessage: '',
      retryTimeout: null,
      editorOptions: {
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
      },
      mode: 'assistant'
    }
  },
  mounted() {
    const route = useRoute()
    this.mode = route.query.mode || 'assistant';
    if (this.mode === 'assistant') {
      const aiPanel = document.getElementById('aiPanel')
      if (aiPanel) {
        this.bsCollapse = new Collapse(aiPanel, { toggle: false })
      }
    }
    if (this.exercise) {
      this.code = this.exercise.starter_code || 'print("Hello, World!")';
      this.language = this.exercise.language || 'python';
    }
  },
  methods: {
  async executeCode() {
    this.loading = true;
    this.output = '';
    this.error = '';

    try {
      const response = await api.post('/api/code/execute', {
        code: this.code,
        language: this.language
      });

      this.output = response.data.output;
      if (response.data.error) {
        this.error = response.data.error;
      }
    } catch (error) {
      this.error = 'Failed to connect to backend: ' + error.message;
    } finally {
      this.loading = false;
    }
  },
    handleAIResponse(response) {
      this.aiResponse = response.response;
      this.aiPanelOpen = true;
    },
    handleAIError(error) {
      this.errorMessage = `AI Assistant Error: ${error}`
      this.showErrorPopup = true
      setTimeout(() => (this.showErrorPopup = false), 5000)
    },
    applyAISuggestions() {
      if (this.aiResponse) {
        this.code = this.aiResponse;
      }
    },
    toggleAIPanel() {
    if (this.bsCollapse) {
      if (this.aiPanelOpen) {
        this.bsCollapse.hide()
      } else {
        this.bsCollapse.show()
      }
      this.aiPanelOpen = !this.aiPanelOpen
    }
    },
    handleSubmission(result) {
      console.log("Grading result:", result)
      // TODO: display result or feedback modal
    },
    handleSubmissionError(err) {
      console.error("Submission failed:", err)
    }
  }
};
</script>

<style scoped>
.code-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  height: 100%;
}

.output {
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.toggle-btn {
  height: fit-content;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 0.5rem 0.25rem;
  border-radius: 0.25rem 0 0 0.25rem;
  font-size: 0.75rem;
  align-self: center;
}

.ai-panel-card {
  width: 400px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-content {
  overflow-y: auto;
  flex: 1;
}
</style>
