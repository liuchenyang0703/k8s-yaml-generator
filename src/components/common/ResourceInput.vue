<template>
  <el-input v-model="localValue" :placeholder="placeholder">
    <template v-if="tip" #append>{{ tip }}</template>
  </el-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  tip?: string
}>(), {
  modelValue: '',
  placeholder: '例如 100m / 128Mi',
  tip: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})
</script>
