<template>
  <div
    class="modal fade"
    tabindex="-1"
    ref="modal"
    aria-labelledby="modeModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content bg-dark text-light shadow-lg">
        <div class="modal-header border-secondary">
          <h5 class="modal-title" id="modeModalLabel">
            Choose a Mode
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body text-center">
          <div class="d-flex flex-wrap justify-content-center gap-4 my-3">
            <div
              class="card mode-card assistant text-center p-4"
              @click="selectMode('assistant')"
            >
              <img
                src="@/assets/assistant-logo.svg"
                alt="Assistant mode"
                class="mode-image mb-3"
              />
              <h4>Assistant Mode</h4>
              <p class="small opacity-75">Collaborate with the AI as your coding partner.</p>
            </div>

            <div
              class="card mode-card rival text-center p-4"
              @click="selectMode('rival')"
            >
              <img
                src="@/assets/rival-logo.svg"
                alt="Rival mode"
                class="mode-image mb-3"
              />
              <h4>Rival Mode</h4>
              <p class="small opacity-75">Compete against the AI to test your skills.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer border-0 justify-content-center">
          <button
            type="button"
            class="btn btn-outline-light px-4"
            data-bs-dismiss="modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Modal } from "bootstrap";

const emit = defineEmits(["select-mode"]);
const modal = ref(null);
let bsModal = null;

onMounted(() => {
  bsModal = new Modal(modal.value, { backdrop: "static", keyboard: true });
});

onBeforeUnmount(() => {
  if (bsModal) bsModal.dispose();
});

function show() {
  bsModal?.show();
}

function hide() {
  bsModal?.hide();
}

function selectMode(mode) {
  emit("select-mode", mode);
  hide();
}

defineExpose({ show, hide });
</script>

<style scoped>

.modal-content {
  border-radius: 1rem;
  background: rgba(33, 37, 41, 0.95);
  backdrop-filter: blur(4px);
}

.mode-card {
  width: 240px;
  border: none;
  border-radius: 1rem;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.mode-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

.mode-card.assistant {
  background: linear-gradient(135deg, #007bff, #00b4d8);
}
.mode-card.rival {
  background: linear-gradient(135deg, #dc3545, #ff6b6b);
}

.mode-image {
  width: 70px;
  height: 70px;
}
</style>
