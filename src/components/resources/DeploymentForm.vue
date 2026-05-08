<template>
  <div class="form-page">
    <el-form label-width="150px" label-position="left">
      <MetadataEditor :model="localForm" title="基础配置" />
      <el-card shadow="never">
        <template #header>工作负载配置</template>
        <div class="grid-four">
          <el-form-item label="副本数">
            <el-input-number v-model="localForm.replicas" :min="1" />
          </el-form-item>
          <el-form-item label="更新策略">
            <el-select v-model="localForm.strategy.type" placeholder="可不选">
              <el-option label="不指定" value="" />
              <el-option label="滚动更新" value="RollingUpdate" />
              <el-option label="重建" value="Recreate" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="localForm.strategy.type === 'RollingUpdate'" label="最大新增 Pod">
            <el-input v-model="localForm.strategy.maxSurge" />
          </el-form-item>
          <el-form-item v-if="localForm.strategy.type === 'RollingUpdate'" label="最大不可用 Pod">
            <el-input v-model="localForm.strategy.maxUnavailable" />
          </el-form-item>
        </div>
        <el-form-item label="选择器标签">
          <KeyValueEditor v-model="localForm.matchLabels" key-placeholder="标签键" value-placeholder="标签值" />
        </el-form-item>
      </el-card>
      <PodTemplateEditor :model="localForm.podTemplate" title="Pod 模板" />
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { DeploymentFormData } from '@/types/k8s'
import MetadataEditor from '@/components/common/MetadataEditor.vue'
import KeyValueEditor from '@/components/common/KeyValueEditor.vue'
import PodTemplateEditor from '@/components/common/PodTemplateEditor.vue'
const props = defineProps<{ modelValue: DeploymentFormData }>()
const emit = defineEmits<{ 'update:modelValue':[value:DeploymentFormData] }>()
const localForm = computed({ get:()=>props.modelValue, set:(value:DeploymentFormData)=>emit('update:modelValue', value) })
</script>
<style scoped>.form-page{display:grid;gap:16px}.grid-four{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}</style>
