<template>
  <div class="form-page">
    <el-form label-width="150px" label-position="left">
      <el-card shadow="never">
        <template #header>
          基础配置
        </template>

        <el-form-item label="名称" required>
          <el-input v-model="localForm.metadata.name" />
        </el-form-item>

        <el-form-item label="命名空间">
          <el-input v-model="localForm.metadata.namespace" />
        </el-form-item>

        <el-form-item label="服务类型">
          <el-select v-model="localForm.type">
            <el-option label="ClusterIP" value="ClusterIP" />
            <el-option label="NodePort" value="NodePort" />
            <el-option label="LoadBalancer" value="LoadBalancer" />
            <el-option label="ExternalName" value="ExternalName" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="localForm.type === 'ClusterIP'"
          label="负载策略"
        >
          <el-select
            v-model="localForm.sessionAffinity"
            placeholder="选择负载策略"
          >
            <el-option label="默认" value="" />
            <el-option label="轮询" value="None" />
            <el-option label="客户端 IP" value="ClientIP" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="localForm.type === 'NodePort'"
          label="负载策略"
        >
          <el-select
            v-model="localForm.externalTrafficPolicy"
            placeholder="选择策略"
          >
            <el-option label="默认" value="" />
            <el-option label="Cluster" value="Cluster" />
            <el-option label="Local" value="Local" />
          </el-select>
        </el-form-item>

        <el-form-item label="元数据标签">
          <KeyValueEditor
            v-model="localForm.metadata.labels"
            key-placeholder="标签键"
            value-placeholder="标签值"
          />
        </el-form-item>

        <el-form-item label="元数据注解">
          <KeyValueEditor
            v-model="localForm.metadata.annotations"
            key-placeholder="注解键"
            value-placeholder="注解值"
          />
        </el-form-item>
      </el-card>

      <el-card
        v-if="localForm.type !== 'ExternalName'"
        shadow="never"
      >
        <template #header>
          选择器与端口
        </template>

        <el-form-item label="选择器">
          <KeyValueEditor
            v-model="localForm.selector"
            key-placeholder="标签键"
            value-placeholder="标签值"
          />
        </el-form-item>

        <el-form-item
          v-if="localForm.type === 'ClusterIP'"
          label="指定 ClusterIP"
        >
          <el-input
            v-model="localForm.clusterIP"
            placeholder="留空表示自动分配"
          />
        </el-form-item>

        <ArrayEditor
          v-model="localForm.ports"
          title="端口"
          label-key="name"
          :create-item="createPort"
        >
          <template #default="{ item }">
            <div class="port-grid">
              <el-form-item label="名称">
                <el-input v-model="item.name" />
              </el-form-item>

              <el-form-item label="服务端口">
                <el-input-number
                  v-model="item.port"
                  :min="1"
                  :max="65535"
                  class="full-width"
                />
              </el-form-item>

              <el-form-item label="目标端口">
                <el-input v-model="item.targetPort" />
              </el-form-item>

              <el-form-item label="协议">
                <el-select v-model="item.protocol">
                  <el-option label="TCP" value="TCP" />
                  <el-option label="UDP" value="UDP" />
                  <el-option label="SCTP" value="SCTP" />
                </el-select>
              </el-form-item>

              <el-form-item
                v-if="localForm.type === 'NodePort'"
                label="节点端口"
              >
                <el-input-number
                  v-model="item.nodePort"
                  :min="30000"
                  :max="32767"
                  class="full-width"
                />
              </el-form-item>
            </div>
          </template>
        </ArrayEditor>
      </el-card>

      <el-card v-else shadow="never">
        <template #header>
          ExternalName 配置
        </template>

        <el-form-item label="外部域名">
          <el-input
            v-model="localForm.externalName"
            placeholder="例如 api.example.com"
          />
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ServiceFormData, ServicePort } from '@/types/k8s';

import KeyValueEditor from '@/components/common/KeyValueEditor.vue';
import ArrayEditor from '@/components/common/ArrayEditor.vue';

const props = defineProps<{
  modelValue: ServiceFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ServiceFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: ServiceFormData) =>
    emit('update:modelValue', value)
});

const createPort = (): ServicePort => ({
  name: '',
  port: 80,
  targetPort: 80,
  protocol: 'TCP'
});
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 20px;
}

.port-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 18px 15px;
}

.full-width {
  width: 100%;
}

:deep(.el-select),
:deep(.el-input),
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .port-grid {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .port-grid {
    grid-template-columns: 1fr;
  }
}
</style>