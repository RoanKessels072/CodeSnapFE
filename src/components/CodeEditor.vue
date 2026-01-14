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
        :difficulty="rivalDifficulty"
        :exercise="exercise"
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
        class="d-flex align-items-stretch"
      >
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

    <!-- Assistant Mode Results Modal -->
    <div
      class="modal fade"
      id="resultsModal"
      tabindex="-1"
      aria-labelledby="resultsModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body text-center py-4">
            <h3 class="mb-4">Submission Results</h3>

            <!-- Score Display -->
            <div class="score-circle mx-auto mb-4" :class="getScoreClass(submissionResult.score)">
              <div class="score-number">{{ submissionResult.score }}</div>
              <div class="score-label">Pass rate:</div>
            </div>

            <!-- Stars Display -->
            <div class="mb-4">
              <div class="score-label mb-2 text-muted">Style Score</div>
              <div class="stars-display">
                <i
                  v-for="n in 3"
                  :key="n"
                  :class="n <= submissionResult.stars ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"
                  class="star-icon"
                ></i>
              </div>
              <p class="mt-2 text-muted">{{ submissionResult.stars }} / 3 Stars</p>
            </div>

            <!-- Message based on performance -->
            <div class="mb-4">
              <h5 :class="getMessageClass(submissionResult.stars)">
                {{ getPerformanceMessage(submissionResult.stars) }}
              </h5>
            </div>
          </div>
          <div class="modal-footer border-0 justify-content-center gap-2">
            <button
              type="button"
              class="btn btn-outline-primary"
              data-bs-dismiss="modal"
            >
              Keep Working
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="returnToOverview"
            >
              Back to Exercises
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rival Mode Results Modal -->
    <div
      class="modal fade"
      id="rivalResultsModal"
      tabindex="-1"
      aria-labelledby="rivalResultsModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body py-4">
            <h3 class="text-center mb-4">Battle Results</h3>

            <!-- Winner Announcement -->
            <div class="text-center mb-4">
              <div class="winner-badge" :class="getWinnerBadgeClass()">
                <i :class="getWinnerIcon()" class="fs-1 mb-2"></i>
                <h4 class="mb-0">{{ getWinnerText() }}</h4>
              </div>
            </div>

            <!-- Side-by-side comparison -->
            <div class="row g-4">
              <!-- User Score -->
              <div class="col-md-6">
                <div class="result-card" :class="{ 'winner-card': isUserWinner() }">
                  <h5 class="text-center mb-3">
                    <i class="bi bi-person-fill me-2"></i>You
                  </h5>

                  <!-- Score Circle -->
                  <div class="score-circle-small mx-auto mb-3" :class="getScoreClass(rivalResult.userScore)">
                    <div class="score-number-small">{{ rivalResult.userScore }}</div>
                    <div class="score-label-small">Pass rate:</div>
                  </div>

                  <!-- Stars -->
                  <div class="text-center mb-3">
                    <div class="score-label-small mb-2 text-muted">Style Score</div>
                    <div class="stars-display-small">
                      <i
                        v-for="n in 3"
                        :key="n"
                        :class="n <= rivalResult.userStars ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"
                      ></i>
                    </div>
                    <p class="small text-muted mb-0">{{ rivalResult.userStars }} / 3 Stars</p>
                  </div>
                </div>
              </div>

              <!-- Rival Score -->
              <div class="col-md-6">
                <div class="result-card" :class="{ 'winner-card': isRivalWinner() }">
                  <h5 class="text-center mb-3">
                    <i class="bi bi-robot me-2"></i>Rival ({{ capitalizeFirst(rivalDifficulty) }})
                  </h5>

                  <!-- Score Circle -->
                  <div class="score-circle-small mx-auto mb-3" :class="getScoreClass(rivalResult.rivalScore)">
                    <div class="score-number-small">{{ rivalResult.rivalScore }}</div>
                    <div class="score-label-small">Pass rate:</div>
                  </div>

                  <!-- Stars -->
                  <div class="text-center mb-3">
                    <div class="score-label-small mb-2 text-muted">Style Score</div>
                    <div class="stars-display-small">
                      <i
                        v-for="n in 3"
                        :key="n"
                        :class="n <= rivalResult.rivalStars ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"
                      ></i>
                    </div>
                    <p class="small text-muted mb-0">{{ rivalResult.rivalStars }} / 3 Stars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 justify-content-center gap-2">
            <button
              type="button"
              class="btn btn-outline-primary"
              data-bs-dismiss="modal"
            >
              Try Again
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="returnToOverview"
            >
              Back to Exercises
            </button>
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
import SubmitButton from './SubmitButton.vue';
import { useRoute, useRouter } from 'vue-router'
import { Collapse, Modal } from 'bootstrap'

export default {
  name: 'CodeEditor',
  components: { VueMonacoEditor, AssistantButton, SubmitButton },
  props: {
    exercise: {
      type: Object,
      default: null
    }
  },
  setup() {
    const router = useRouter()
    return { router }
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
      resultsModal: null,
      rivalResultsModal: null,
      showErrorPopup: false,
      errorMessage: '',
      submissionResult: {
        score: 0,
        stars: 0,
        attempt_id: null
      },
      rivalResult: {
        userScore: 0,
        userStars: 0,
        rivalScore: 0,
        rivalStars: 0,
        attempt_id: null
      },
      editorOptions: {
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
      },
      rivalDifficulty: 'medium',
      mode: 'assistant'
    }
  },
  mounted() {
    const route = useRoute()
    this.mode = route.query.mode || 'assistant';
    this.rivalDifficulty = route.query.difficulty || 'medium';

    if (this.mode === 'assistant') {
      const aiPanel = document.getElementById('aiPanel')
      if (aiPanel) {
        this.bsCollapse = new Collapse(aiPanel, { toggle: false })
      }
    }

    if (this.mode === 'assistant') {
      const modalEl = document.getElementById('resultsModal')
      if (modalEl) {
        this.resultsModal = new Modal(modalEl)
      }
    } else if (this.mode === 'rival') {
      const rivalModalEl = document.getElementById('rivalResultsModal')
      if (rivalModalEl) {
        this.rivalResultsModal = new Modal(rivalModalEl)
      }
    }

    if (this.exercise) {
      this.code = this.exercise.starter_code || 'print("Hello, World!")';
      this.language = this.exercise.language || 'python';
    }
  },
  beforeUnmount() {
    if (this.resultsModal) {
      this.resultsModal.dispose()
    }
    if (this.rivalResultsModal) {
      this.rivalResultsModal.dispose()
    }
  },
  methods: {
    async executeCode() {
      this.loading = true;
      this.output = '';
      this.error = '';

      try {
        const response = await api.post('/code/execute', {
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

      if (this.mode === 'assistant') {
        this.submissionResult = {
          score: result.score || 0,
          stars: result.stars || 0,
          attempt_id: result.attempt_id
        }

        if (this.resultsModal) {
          this.resultsModal.show()
        }
      } else if (this.mode === 'rival') {
        this.rivalResult = {
          userScore: result.user_result.score || 0,
          userStars: result.user_result.stars || 0,
          rivalScore: result.ai_result.score || 0,
          rivalStars: result.ai_result.stars || 0,
          attempt_id: result.user_result.attempt_id
        }

        if (this.rivalResultsModal) {
          this.rivalResultsModal.show()
        }
      }
    },
    handleSubmissionError(err) {
      console.error("Submission failed:", err)
      this.errorMessage = `Submission failed: ${err}`
      this.showErrorPopup = true
      setTimeout(() => (this.showErrorPopup = false), 5000)
    },
    getScoreClass(score) {
      if (score >= 90) return 'score-excellent'
      if (score >= 70) return 'score-good'
      if (score >= 50) return 'score-fair'
      return 'score-poor'
    },
    getMessageClass(stars) {
      if (stars === 3) return 'text-success'
      if (stars === 2) return 'text-warning'
      if (stars === 1) return 'text-info'
      return 'text-danger'
    },
    getPerformanceMessage(stars) {
      const messages = {
        3: '🎉 Perfect! Excellent work!',
        2: '👍 Nice! Care to try for a perfect score?',
        1: "💪 Keep trying! There's room to improve.",
        0: '🔄 Too bad! Want to give it another try?'
      }
      return messages[stars] || messages[0]
    },
    isUserWinner() {
      if (this.rivalResult.userStars > this.rivalResult.rivalStars) return true
      if (this.rivalResult.userStars === this.rivalResult.rivalStars) {
        return this.rivalResult.userScore > this.rivalResult.rivalScore
      }
      return false
    },
    isRivalWinner() {
      if (this.rivalResult.rivalStars > this.rivalResult.userStars) return true
      if (this.rivalResult.rivalStars === this.rivalResult.userStars) {
        return this.rivalResult.rivalScore > this.rivalResult.userScore
      }
      return false
    },
    getWinnerText() {
      if (this.isUserWinner()) return 'You Win! 🎉'
      if (this.isRivalWinner()) return 'Rival Wins!'
      return "It's a Tie!"
    },
    getWinnerIcon() {
      if (this.isUserWinner()) return 'bi bi-trophy-fill text-warning'
      if (this.isRivalWinner()) return 'bi bi-robot text-danger'
      return 'bi bi-dash-circle text-secondary'
    },
    getWinnerBadgeClass() {
      if (this.isUserWinner()) return 'winner-badge-success'
      if (this.isRivalWinner()) return 'winner-badge-danger'
      return 'winner-badge-tie'
    },
    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    returnToOverview() {
      if (this.resultsModal) {
        this.resultsModal.hide()
      }
      if (this.rivalResultsModal) {
        this.rivalResultsModal.hide()
      }
      this.router.push('/exercises')
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

.stars-display {
  font-size: 3rem;
  letter-spacing: 0.5rem;
}

.stars-display-small {
  font-size: 2rem;
  letter-spacing: 0.25rem;
}

.star-icon {
  transition: transform 0.2s;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 4px solid;
  transition: all 0.3s;
}

.score-number {
  font-size: 2.5rem;
  font-weight: bold;
}

.score-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-circle-small {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 3px solid;
  transition: all 0.3s;
}

.score-number-small {
  font-size: 2rem;
  font-weight: bold;
}

.score-label-small {
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-excellent {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.score-good {
  background-color: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

.score-fair {
  background-color: #fff3e0;
  border-color: #ff9800;
  color: #e65100;
}

.score-poor {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.modal-content {
  border-radius: 1rem;
}

/* Rival mode specific styles */
.winner-badge {
  padding: 2rem;
  border-radius: 1rem;
  margin: 0 auto;
  max-width: 400px;
}

.winner-badge-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 3px solid #28a745;
}

.winner-badge-danger {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border: 3px solid #dc3545;
}

.winner-badge-tie {
  background: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
  border: 3px solid #6c757d;
}

.result-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  transition: all 0.3s;
}

.winner-card {
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
  border: 3px solid #ffc107;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  transform: scale(1.02);
}
</style>
