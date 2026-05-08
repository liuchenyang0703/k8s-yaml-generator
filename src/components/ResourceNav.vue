<template>
  <div class="nav-wrap">
    <div class="nav-header">
      <span>资源类型</span>
      <el-tag type="success">18 / 18</el-tag>
    </div>
    <div v-for="group in groups" :key="group.name" class="group-block">
      <div class="group-title">{{ group.name }}</div>
      <el-menu :default-active="modelValue" @select="handleSelect">
        <el-menu-item v-for="item in group.items" :key="item.kind" :index="item.kind">
          <div class="nav-item"><strong>{{ item.title }}</strong><small>{{ item.description }}</small></div>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RESOURCE_LIST } from '@/constants/resources'
import type { ResourceKind } from '@/types/k8s'
defineProps<{ modelValue: ResourceKind }>()
const emit = defineEmits<{ 'update:modelValue':[value:ResourceKind] }>()
const groups = computed(() => Object.entries(RESOURCE_LIST.reduce((acc, item) => { (acc[item.group] ||= []).push(item); return acc }, {} as Record<string, typeof RESOURCE_LIST>)).map(([name, items]) => ({ name, items })))
const handleSelect = (value: string) => emit('update:modelValue', value as ResourceKind)
</script>
<style scoped>
.nav-wrap{display:flex;flex-direction:column;gap:14px}.nav-header{display:flex;align-items:center;justify-content:space-between}.group-block{display:grid;gap:8px}.group-title{font-size:13px;color:#64748b;font-weight:700}.nav-item{display:flex;flex-direction:column;gap:4px;line-height:1.3}.nav-item small{color:#64748b}
</style>
