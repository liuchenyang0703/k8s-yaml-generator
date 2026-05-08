<template>
  <div class="editor-wrap">
    <div v-for="(item, index) in rows" :key="item.id" class="row">
      <el-input v-model="item.key" :placeholder="keyPlaceholder" clearable @input="emitChange" />
      <el-input v-model="item.value" :placeholder="valuePlaceholder" clearable @input="emitChange" />
      <el-button type="danger" plain @click="removeRow(index)">删除</el-button>
    </div>
    <el-button type="primary" plain @click="addRow">添加键值对</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface RowItem {
  id: string
  key: string
  value: string
}

const props = withDefaults(defineProps<{
  modelValue: Record<string, string>
  keyPlaceholder?: string
  valuePlaceholder?: string
}>(), {
  keyPlaceholder: '键',
  valuePlaceholder: '值'
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const rows = ref<RowItem[]>([])
const internalUpdating = ref(false)

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
const buildRows = (value: Record<string, string>) => Object.entries(value ?? {}).map(([key, val]) => ({ id: createId(), key, value: val }))

watch(
  () => props.modelValue,
  (value) => {
    if (internalUpdating.value) return
    rows.value = buildRows(value ?? {})
  },
  { immediate: true }
)

const emitChange = () => {
  internalUpdating.value = true
  const payload = rows.value.reduce<Record<string, string>>((acc, cur) => {
    if (cur.key.trim()) acc[cur.key] = cur.value
    return acc
  }, {})
  emit('update:modelValue', payload)
  queueMicrotask(() => {
    internalUpdating.value = false
  })
}

const addRow = () => {
  rows.value.push({ id: createId(), key: '', value: '' })
}

const removeRow = (index: number) => {
  rows.value.splice(index, 1)
  emitChange()
}
</script>

<style scoped>
.editor-wrap {
  display: grid;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
}
</style>
