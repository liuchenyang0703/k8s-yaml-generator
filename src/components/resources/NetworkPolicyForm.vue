<template>
  <div class="form-page">
    <el-form label-width="150px" label-position="left">
      <MetadataEditor :model="localForm" title="基础配置" />
      <el-card shadow="never">
        <template #header>NetworkPolicy 配置</template>
        <el-form-item label="Pod Selector"><KeyValueEditor v-model="localForm.podSelector" /></el-form-item>
        <el-form-item label="策略类型">
          <el-select v-model="localForm.policyTypes" multiple>
            <el-option label="Ingress" value="Ingress" />
            <el-option label="Egress" value="Egress" />
          </el-select>
        </el-form-item>
        <ArrayEditor v-model="localForm.ingress" title="Ingress Rules" :create-item="createRule">
          <template #default="{ item, index }">
            <NetworkRuleEditor :model-value="item" @update:model-value="updateIngressRule(index, $event)" />
          </template>
        </ArrayEditor>
        <ArrayEditor v-model="localForm.egress" title="Egress Rules" :create-item="createRule">
          <template #default="{ item, index }">
            <NetworkRuleEditor :model-value="item" @update:model-value="updateEgressRule(index, $event)" />
          </template>
        </ArrayEditor>
      </el-card>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { NetworkPolicyFormData } from '@/types/k8s'
import MetadataEditor from '@/components/common/MetadataEditor.vue'
import KeyValueEditor from '@/components/common/KeyValueEditor.vue'
import ArrayEditor from '@/components/common/ArrayEditor.vue'
import NetworkRuleEditor from '@/components/common/NetworkRuleEditor.vue'
const props = defineProps<{ modelValue: NetworkPolicyFormData }>()
const emit = defineEmits<{ 'update:modelValue':[value:NetworkPolicyFormData] }>()
const localForm = computed({ get:()=>props.modelValue, set:(value:NetworkPolicyFormData)=>emit('update:modelValue', value) })
const createRule = ()=>({ peers:[{ peerType:'namespaceSelector', labels:{}, cidr:'', except:[] }], ports:[{ port:80, protocol:'TCP' }] })
function updateIngressRule(index: number, value: any) {
  const next = [...(localForm.value.ingress || [])]
  next[index] = value
  localForm.value = { ...localForm.value, ingress: next }
}
function updateEgressRule(index: number, value: any) {
  const next = [...(localForm.value.egress || [])]
  next[index] = value
  localForm.value = { ...localForm.value, egress: next }
}
</script>
<style scoped>.form-page{display:grid;gap:16px}</style>
