<template>
  <div v-if="showErrorPopup" class="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1050;">
    {{ errorMessage }}
    <button type="button" class="btn-close" @click="showErrorPopup = false"></button>
  </div>

  <div class="code-editor">
    <div class="toolbar bg-light p-2 mb-3 rounded">
      <div class="d-flex gap-2">
        <select v-model="language" class="form-select" style="width: auto;">
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <button @click="executeCode" :disabled="loading" class="btn btn-success">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          {{ loading ? 'Running...' : 'Run Code' }}
        </button>
        <AssistantButton
          :code="code"
          :language="language"
          @ai-response="handleAIResponse"
          @ai-error="handleAIError"
        />
      </div>
    </div>

    <div class="editor-container">
      <div class="editor border rounded">
        <vue-monaco-editor
          v-model:value="code"
          :language="language"
          theme="vs-dark"
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

      <!-- Bootstrap Horizontal Collapsible AI Panel -->
      <div class="d-flex">
        <button
          class="btn btn-primary btn-sm toggle-btn"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#aiPanelContent"
          @click="aiPanelOpen = !aiPanelOpen"
        >
          {{ aiPanelOpen ? 'Close' : 'Open' }}
        </button>

        <div class="collapse collapse-horizontal show" id="aiPanelContent">
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
              <pre class="mb-0">{{ aiResponse || 'No AI suggestions yet. Click the AI Assistant button to get help.' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import axios from 'axios'
import AssistantButton from './AssistantButton.vue';

export default {
  name: 'CodeEditor',
  components: {
    VueMonacoEditor,
    AssistantButton
  },
  data() {
    return {
      code: 'print("Hello, World!")',
      language: 'python',
      output: '',
      error: '',
      loading: false,
      aiResponse: '',
      aiPanelOpen: true,
      showErrorPopup: false,
      errorMessage: '',
      retryTimeout: null,
      editorOptions: {
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
      }
    }
  },
  methods: {
    async executeCode() {
      this.loading = true
      this.output = ''
      this.error = ''

      try {
        const response = await axios.post('http://localhost:5000/api/execute', {
          code: this.code,
          language: this.language
        })

        this.output = response.data.output
        if (response.data.error) {
          this.error = response.data.error
        }
      } catch (error) {
        this.error = 'Failed to connect to backend: ' + error.message
      } finally {
        this.loading = false
      }
    },
    handleAIResponse(response) {
      this.aiResponse = response.response;
      this.aiPanelOpen = true;
    },
    handleAIError(error) {
      this.errorMessage = `AI Assistant Error: ${error}`;
      this.showErrorPopup = true;
      if (error.toLowerCase().includes("overload")) {
        this.retryTimeout = setTimeout(() => {
          this.showErrorPopup = false;
          this.executeAIRequest();
        }, 3000);
      } else {
        setTimeout(() => {
          this.showErrorPopup = false;
        }, 5000);
      }
    },
    applyAISuggestions() {
      if (this.aiResponse) {
        this.code = this.aiResponse;
      }
    }
  }
};
</script>

<style scoped>
.code-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  height: 500px;
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
