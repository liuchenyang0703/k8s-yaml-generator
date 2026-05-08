<template>
  <div class="array-editor">
    <div class="header">
      <span>{{ title }}</span>
      <el-button type="primary" plain @click="addItem">新增</el-button>
    </div>
    <el-card v-for="(item, index) in localItems" :key="index" shadow="never" class="item-card">
      <template #header>
        <div class="card-header">
          <span>{{ itemTitle(index) }}</span>
          <el-button type="danger" link @click="removeItem(index)">删除</el-button>
        </div>
      </template>
      <slot :item="item" :index="index" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: Record<string, any>[]
  title: string
  createItem: () => Record<string, any>
  labelKey?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>[]]
}>()

const localItems = computed<Record<string, any>[]>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const addItem = () => {
  localItems.value = [...localItems.value, props.createItem()]
}

const removeItem = (index: number) => {
  const next = [...localItems.value]
  next.splice(index, 1)
  localItems.value = next
}

const readByPath = (obj: any, path?: string) => !path ? undefined : path.split('.').reduce((acc, key) => acc?.[key], obj)
const itemTitle = (index: number) => readByPath(localItems.value[index], props.labelKey) || `${props.title} #${index + 1}`
</script>

<style scoped>
.array-editor{display:grid;gap:12px}
.header,.card-header{display:flex;align-items:center;justify-content:space-between}
.item-card{border-radius:12px}
</style>
