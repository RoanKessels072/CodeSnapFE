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
  mounted() {
    // Load exercise starter code if available
    if (this.exercise) {
      this.code = this.exercise.starter_code || 'print("Hello, World!")';
      this.language = this.exercise.language || 'python';
    } else {
      this.code = 'print("Hello, World!")';
    }
  },
  watch: {
    exercise(newExercise) {
      if (newExercise) {
        this.code = newExercise.starter_code || 'print("Hello, World!")';
        this.language = newExercise.language || 'python';
      }
    }
  },
  methods: {
    async executeCode() {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      this.loading = true
      this.output = ''
      this.error = ''

      try {
        const response = await axios.post(`${API_BASE_URL}/api/code/execute`, {
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
