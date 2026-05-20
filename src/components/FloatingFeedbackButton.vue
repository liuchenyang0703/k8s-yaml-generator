<template>
  <button
    class="feedback-button"
    type="button"
    title="问题反馈"
    aria-label="问题反馈"
    :style="buttonStyle"
    @pointerdown="handlePointerDown"
    @click="handleClick"
  >
    <svg
      class="feedback-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 4.25a7.75 7.75 0 1 0 0 15.5 7.75 7.75 0 0 0 0-15.5Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.65"
      />
      <path
        d="M9.85 9.25a2.25 2.25 0 0 1 4.3.95c0 1.62-2.15 1.76-2.15 3.05"
        fill="none"
        stroke="currentColor"
        stroke-width="1.65"
        stroke-linecap="round"
      />
      <circle
        cx="12"
        cy="15.85"
        r="0.75"
        fill="currentColor"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const feedbackUrl = 'https://github.com/liuchenyang0703/k8s-yaml-generator/discussions';
const edgeGap = 20;

const buttonRef = ref({
  width: 34,
  height: 34
});
const position = ref({
  left: 0,
  top: 0
});
const dragState = ref({
  active: false,
  moved: false,
  offsetX: 0,
  offsetY: 0
});
const hasCustomPosition = ref(false);

const buttonStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`
}));

const clampPosition = (left: number, top: number) => ({
  left: Math.min(Math.max(edgeGap, left), window.innerWidth - buttonRef.value.width - edgeGap),
  top: Math.min(Math.max(edgeGap, top), window.innerHeight - buttonRef.value.height - edgeGap)
});

const setDefaultPosition = () => {
  position.value = clampPosition(
    window.innerWidth - buttonRef.value.width - edgeGap,
    window.innerHeight - buttonRef.value.height - edgeGap
  );
};

const handleResize = () => {
  if (!hasCustomPosition.value) {
    setDefaultPosition();
    return;
  }

  position.value = clampPosition(position.value.left, position.value.top);
};

const handlePointerMove = (event: PointerEvent) => {
  if (!dragState.value.active) return;

  const nextPosition = clampPosition(
    event.clientX - dragState.value.offsetX,
    event.clientY - dragState.value.offsetY
  );

  if (
    Math.abs(nextPosition.left - position.value.left) > 2 ||
    Math.abs(nextPosition.top - position.value.top) > 2
  ) {
    dragState.value.moved = true;
  }

  position.value = nextPosition;
};

const handlePointerUp = () => {
  if (dragState.value.active && dragState.value.moved) {
    hasCustomPosition.value = true;
  }

  dragState.value.active = false;
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
};

const handlePointerDown = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  buttonRef.value = {
    width: rect.width,
    height: rect.height
  };
  dragState.value = {
    active: true,
    moved: false,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
};

const handleClick = () => {
  if (dragState.value.moved) return;

  window.open(feedbackUrl, '_blank', 'noopener,noreferrer');
};

onMounted(async () => {
  await nextTick();
  setDefaultPosition();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
});
</script>

<style scoped>
.feedback-button {
  position: fixed;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid #bfdbfe;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  color: #2563eb;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
  cursor: grab;
  user-select: none;
  touch-action: none;
  backdrop-filter: blur(8px);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.feedback-button:active {
  cursor: grabbing;
}

.feedback-button:hover {
  color: #1d4ed8;
  border-color: #60a5fa;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.18);
  transform: translateY(-1px);
}

.feedback-icon {
  width: 22px;
  height: 22px;
  flex: none;
}
</style>
