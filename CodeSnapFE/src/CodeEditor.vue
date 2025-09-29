<template>
  <div class="code-editor">
    <div class="toolbar">
      <select v-model="language">
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
      </select>
      <button @click="executeCode" :disabled="loading">
        {{ loading ? 'Running...' : 'Run Code' }}
      </button>
    </div>
    
    <div class="editor-container">
      <div class="editor">
        <MonacoEditor
          v-model="code"
          :language="language"
          theme="vs-dark"
          :options="editorOptions"
        />
      </div>
      
      <div class="output">
        <h3>Output:</h3>
        <pre>{{ output }}</pre>
        <div v-if="error" class="error">
          <h4>Error:</h4>
          <pre>{{ error }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MonacoEditor } from '@monaco-editor/vue'
import axios from 'axios'

export default {
  name: 'CodeEditor',
  components: {
    MonacoEditor
  },
  data() {
    return {
      code: 'print("Hello, World!")',
      language: 'python',
      output: '',
      error: '',
      loading: false,
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
    }
  }
}
</script>

<style scoped>
.code-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.editor-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: 500px;
}

.editor, .output {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.output {
  padding: 1rem;
  background: #f9f9f9;
  overflow-y: auto;
}

.error {
  color: red;
  margin-top: 1rem;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>