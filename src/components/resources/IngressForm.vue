<template>
  <div class="form-page">
    <el-form label-width="170px" label-position="left">
      <MetadataEditor
        :model="localForm"
        title="基础配置"
      />

      <el-card shadow="never">
        <template #header>
          Ingress 配置
        </template>

        <el-form-item label="Ingress 类名">
          <el-input v-model="localForm.ingressClassName" />
        </el-form-item>

        <ArrayEditor
          v-model="localForm.rules"
          title="Rules"
          label-key="host"
          :create-item="createRule"
        >
          <template #default="{ item }">
            <el-form-item label="Host">
              <el-input v-model="item.host" />
            </el-form-item>

            <ArrayEditor
              v-model="item.paths"
              title="Paths"
              label-key="path"
              :create-item="createPath"
            >
              <template #default="{ item: path }">
                <div class="path-grid">
                  <el-form-item label="path">
                    <el-input v-model="path.path" />
                  </el-form-item>

                  <el-form-item label="pathType">
                    <el-select v-model="path.pathType">
                      <el-option label="Prefix" value="Prefix" />
                      <el-option label="Exact" value="Exact" />
                      <el-option
                        label="ImplementationSpecific"
                        value="ImplementationSpecific"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="service.name">
                    <el-input v-model="path.serviceName" />
                  </el-form-item>

                  <el-form-item label="service.port 类型">
                    <el-select v-model="path.servicePortType">
                      <el-option label="number" value="number" />
                      <el-option label="name" value="name" />
                    </el-select>
                  </el-form-item>

                  <el-form-item
                    v-if="path.servicePortType === 'number'"
                    label="service.port.number"
                  >
                    <el-input-number
                      v-model="path.servicePort"
                      :min="1"
                      :max="65535"
                      class="full-width"
                    />
                  </el-form-item>

                  <el-form-item
                    v-if="path.servicePortType === 'name'"
                    label="service.port.name"
                  >
                    <el-input v-model="path.servicePortName" />
                  </el-form-item>
                </div>
              </template>
            </ArrayEditor>
          </template>
        </ArrayEditor>

        <ArrayEditor
          v-model="localForm.tls"
          title="TLS"
          label-key="secretName"
          :create-item="createTls"
        >
          <template #default="{ item }">
            <div class="tls-block">
              <el-form-item label="secretName">
                <el-input
                  v-model="item.secretName"
                  placeholder="例如 demo-tls-secret"
                />
              </el-form-item>

              <el-form-item label="hosts">
                <StringListEditor
                  v-model="item.hosts"
                  placeholder="example.com"
                />
              </el-form-item>
            </div>
          </template>
        </ArrayEditor>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { IngressFormData } from '@/types/k8s';

import MetadataEditor from '@/components/common/MetadataEditor.vue';
import ArrayEditor from '@/components/common/ArrayEditor.vue';
import StringListEditor from '@/components/common/StringListEditor.vue';

const props = defineProps<{
  modelValue: IngressFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: IngressFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: IngressFormData) =>
    emit('update:modelValue', value)
});

const createPath = () => ({
  path: '/',
  pathType: 'Prefix',
  serviceName: 'demo-service',
  servicePortType: 'number',
  servicePort: 80,
  servicePortName: ''
});

const createRule = () => ({
  host: '',
  paths: [createPath()]
});

const createTls = () => ({
  hosts: [''],
  secretName: ''
});
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 20px;
}

.path-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 20px 32px;
}

.tls-block {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}

.full-width {
  width: 100%;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  white-space: nowrap;
}

@media (min-width: 1600px) {
  .path-grid {
    grid-template-columns: repeat(3, minmax(300px, 1fr));
  }
}

@media (max-width: 900px) {
  .path-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  :deep(.el-form-item) {
    display: block;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    margin-bottom: 8px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>