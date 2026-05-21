<template>
  <div class="form-page">
    <el-form label-width="190px" label-position="left">
      <MetadataEditor
        :model="localForm"
        title="基础配置"
        :show-namespace="false"
      />

      <el-card shadow="never">
        <template #header>
          StorageClass 配置
        </template>

        <div class="grid-two">
          <el-form-item label="provisionerType">
            <el-select
              v-model="localForm.provisionerMode"
              @change="handleProvisionerModeChange"
            >
              <el-option label="内置" value="builtIn" />
              <el-option label="外部自定义" value="custom" />
            </el-select>
          </el-form-item>

          <el-form-item label="provisioner">
            <el-select
              v-if="localForm.provisionerMode === 'builtIn'"
              v-model="localForm.provisioner"
            >
              <el-option
                v-for="item in builtInProvisioners"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <el-input
              v-else
              v-model="localForm.provisioner"
              placeholder="例如 csi.example.com"
            />
          </el-form-item>

          <el-form-item label="reclaimPolicy">
            <el-select v-model="localForm.reclaimPolicy">
              <el-option label="默认(Delete)" value="Default" />
              <el-option label="Delete" value="Delete" />
              <el-option label="Retain" value="Retain" />
            </el-select>
          </el-form-item>

          <el-form-item label="volumeBindingMode">
            <el-select v-model="localForm.volumeBindingMode">
              <el-option label="默认(Immediate)" value="Default" />
              <el-option label="Immediate" value="Immediate" />
              <el-option label="WaitForFirstConsumer" value="WaitForFirstConsumer" />
            </el-select>
          </el-form-item>

          <el-form-item label="allowVolumeExpansion">
            <el-switch v-model="localForm.allowVolumeExpansion" />
          </el-form-item>
        </div>

        <el-form-item label="parameters">
          <KeyValueEditor
            v-model="localForm.parameters"
            key-placeholder="参数名"
            value-placeholder="参数值"
          />
        </el-form-item>

        <el-form-item label="mountOptions">
          <StringListEditor
            v-model="localForm.mountOptions"
            placeholder="例如 noatime"
          />
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { StorageClassFormData } from '@/types/k8s';

import MetadataEditor from '@/components/common/MetadataEditor.vue';
import KeyValueEditor from '@/components/common/KeyValueEditor.vue';
import StringListEditor from '@/components/common/StringListEditor.vue';

const props = defineProps<{
  modelValue: StorageClassFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: StorageClassFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: StorageClassFormData) =>
    emit('update:modelValue', value)
});

const builtInProvisioners = [
  'kubernetes.io/aws-ebs',
  'kubernetes.io/gce-pd',
  'kubernetes.io/azure-disk',
  'kubernetes.io/azure-file',
  'kubernetes.io/cinder',
  'kubernetes.io/no-provisioner'
];

const handleProvisionerModeChange = (value: StorageClassFormData['provisionerMode']) => {
  if (value === 'custom') {
    localForm.value.provisioner = '';
  }

  if (value === 'builtIn' && !builtInProvisioners.includes(localForm.value.provisioner)) {
    localForm.value.provisioner = 'kubernetes.io/no-provisioner';
  }
};
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 16px;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 900px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>
