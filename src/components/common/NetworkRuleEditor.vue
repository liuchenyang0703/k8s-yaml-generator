<template>
  <div class="rule-wrap">
    <ArrayEditor v-model="localRule.peers" title="Peers" :create-item="createPeer">
      <template #default="{ item }">
        <div class="grid-three">
          <el-form-item label="类型">
            <el-select v-model="item.peerType">
              <el-option label="podSelector" value="podSelector" />
              <el-option label="namespaceSelector" value="namespaceSelector" />
              <el-option label="ipBlock" value="ipBlock" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="item.peerType === 'ipBlock'" label="CIDR"><el-input v-model="item.cidr" /></el-form-item>
          <el-form-item v-if="item.peerType === 'ipBlock'" label="排除网段"><el-input v-model="item.except[0]" placeholder="10.0.0.0/8" /></el-form-item>
        </div>
        <el-form-item v-if="item.peerType !== 'ipBlock'" label="标签"><KeyValueEditor v-model="item.labels" /></el-form-item>
      </template>
    </ArrayEditor>
    <ArrayEditor v-model="localRule.ports" title="Ports" :create-item="createPort">
      <template #default="{ item: port }">
        <div class="grid-two">
          <el-form-item label="端口"><el-input-number v-model="port.port" :min="1" :max="65535" /></el-form-item>
          <el-form-item label="协议"><el-select v-model="port.protocol"><el-option label="TCP" value="TCP" /><el-option label="UDP" value="UDP" /><el-option label="SCTP" value="SCTP" /></el-select></el-form-item>
        </div>
      </template>
    </ArrayEditor>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ArrayEditor from './ArrayEditor.vue'
import KeyValueEditor from './KeyValueEditor.vue'
const props = defineProps<{ modelValue: any }>()
const emit = defineEmits<{ 'update:modelValue': [value: any] }>()
const localRule = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const createPeer = () => ({ peerType: 'namespaceSelector', labels: {}, cidr: '', except: [] })
const createPort = () => ({ port: 80, protocol: 'TCP' })
</script>

<style scoped>.rule-wrap{display:grid;gap:12px}.grid-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.grid-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}</style>
