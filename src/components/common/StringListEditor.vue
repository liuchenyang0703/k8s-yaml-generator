<template>
  <div class="list-wrap">
    <div v-for="(_, index) in rows" :key="index" class="row">
      <el-input v-model="rows[index]" :placeholder="placeholder" />
      <el-button type="danger" plain @click="remove(index)">删除</el-button>
    </div>
    <el-button type="primary" plain @click="add">新增</el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ modelValue: string[]; placeholder?: string }>(), { placeholder: '请输入内容' })
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
const rows = computed({ get: () => props.modelValue, set: (value: string[]) => emit('update:modelValue', value) })
const add = () => { rows.value = [...rows.value, ''] }
const remove = (index: number) => { const next = [...rows.value]; next.splice(index, 1); rows.value = next }
</script>

<style scoped>
.list-wrap { display:grid; gap:10px; }
.row { display:grid; grid-template-columns: 1fr auto; gap:10px; }
</style>
