<template>
  <div class="probe-editor">
    <el-form label-position="top">
      <div class="probe-grid">
        <el-form-item label="探针类型">
          <el-select v-model="localProbe.type" placeholder="请选择探针类型" clearable>
            <el-option label="HTTP 探测" value="httpGet" />
            <el-option label="TCP 探测" value="tcpSocket" />
            <el-option label="命令执行" value="exec" />
          </el-select>
        </el-form-item>

        <template v-if="localProbe.type === 'httpGet'">
          <el-form-item label="HTTP 路径">
            <el-input v-model="localProbe.httpGet.path" />
          </el-form-item>
          <el-form-item label="HTTP 端口">
            <el-input-number v-model="localProbe.httpGet.port" :min="1" :max="65535" />
          </el-form-item>
        </template>

        <template v-else-if="localProbe.type === 'tcpSocket'">
          <el-form-item label="TCP 端口">
            <el-input-number v-model="localProbe.tcpSocketPort" :min="1" :max="65535" />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item class="full-span" label="命令">
            <el-input v-model="localProbe.execCommand" placeholder="例如：sh -c healthcheck.sh" />
          </el-form-item>
        </template>

        <el-form-item label="初始延迟(秒)">
          <el-input-number v-model="localProbe.initialDelaySeconds" :min="0" />
        </el-form-item>
        <el-form-item label="探测周期(秒)">
          <el-input-number v-model="localProbe.periodSeconds" :min="1" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ProbeConfig } from '@/types/k8s'

const props = defineProps<{ modelValue: ProbeConfig }>()
const emit = defineEmits<{ 'update:modelValue': [value: ProbeConfig] }>()

const buildProbe = (probe?: ProbeConfig): ProbeConfig => ({
  type: probe?.type ?? 'httpGet',
  httpGet: probe?.httpGet ?? { path: '/', port: 80 },
  tcpSocketPort: probe?.tcpSocketPort ?? 80,
  execCommand: probe?.execCommand ?? '',
  initialDelaySeconds: probe?.initialDelaySeconds ?? 0,
  periodSeconds: probe?.periodSeconds ?? 10
})

const localProbe = ref<ProbeConfig>(buildProbe(props.modelValue)) as any

watch(
  () => props.modelValue,
  (value) => {
    localProbe.value = buildProbe(value)
  },
  { immediate: true, deep: true }
)

watch(
  localProbe,
  (value) => {
    if (value.type === 'httpGet') {
      value.tcpSocketPort = undefined
      value.execCommand = ''
      value.httpGet = value.httpGet ?? { path: '/', port: 80 }
    } else if (value.type === 'tcpSocket') {
      value.httpGet = undefined
      value.execCommand = ''
      value.tcpSocketPort = value.tcpSocketPort ?? 80
    } else if (value.type === 'exec') {
      value.httpGet = undefined
      value.tcpSocketPort = undefined
      value.execCommand = value.execCommand ?? ''
    }
    emit('update:modelValue', value)
  },
  { deep: true }
)
</script>

<style scoped>
.probe-editor { padding: 4px 0; }
.probe-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.full-span { grid-column:1 / -1; }
@media (max-width: 640px) { .probe-grid { grid-template-columns:1fr; } }
</style>
