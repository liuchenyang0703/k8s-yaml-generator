<template>
  <div class="rule-grid">
    <el-form-item label="API 组"><StringListEditor v-model="localRule.apiGroups" /></el-form-item>
    <el-form-item label="资源"><StringListEditor v-model="localRule.resources" /></el-form-item>
    <el-form-item label="动作">
      <el-select v-model="localRule.verbs" multiple filterable allow-create>
        <el-option v-for="item in COMMON_ROLE_VERBS" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>
    <el-form-item label="资源名称"><StringListEditor v-model="localRule.resourceNames" /></el-form-item>
    <el-form-item v-if="cluster" label="非资源 URL"><StringListEditor v-model="localRule.nonResourceURLs" /></el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { COMMON_ROLE_VERBS } from '@/constants/resources'
import StringListEditor from './StringListEditor.vue'
const props = withDefaults(defineProps<{ modelValue: any; cluster?: boolean }>(), { cluster: false })
const emit = defineEmits<{ 'update:modelValue': [value: any] }>()
const localRule = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
</script>

<style scoped>.rule-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}</style>
