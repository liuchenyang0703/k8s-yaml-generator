<template>
  <div class="form-page">
    <el-form label-width="150px" label-position="left">
      <MetadataEditor :model="localForm" title="Role 基础配置" />
      <el-card shadow="never">
        <template #header>Rules</template>
        <ArrayEditor v-model="localForm.rules" title="规则" :create-item="createPolicyRule">
          <template #default="{ item, index }">
            <PolicyRuleEditor :model-value="item" @update:model-value="updateRule(index, $event)" />
          </template>
        </ArrayEditor>
      </el-card>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { RoleFormData } from '@/types/k8s'
import { createPolicyRule } from '@/composables/useK8sSchema'
import MetadataEditor from '@/components/common/MetadataEditor.vue'
import ArrayEditor from '@/components/common/ArrayEditor.vue'
import PolicyRuleEditor from '@/components/common/PolicyRuleEditor.vue'
const props = defineProps<{ modelValue: RoleFormData }>()
const emit = defineEmits<{ 'update:modelValue':[value:RoleFormData] }>()
const localForm = computed({ get:()=>props.modelValue, set:(value:RoleFormData)=>emit('update:modelValue', value) })
function updateRule(index: number, value: any) {
  const next = [...(localForm.value.rules || [])]
  next[index] = value
  localForm.value = { ...localForm.value, rules: next }
}
</script>
<style scoped>.form-page{display:grid;gap:16px}</style>
