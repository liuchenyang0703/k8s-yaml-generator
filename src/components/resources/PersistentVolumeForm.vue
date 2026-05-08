<template>
  <div class="form-page">
    <el-form label-width="180px" label-position="left">
      <MetadataEditor
        :model="localForm"
        title="基础配置"
        :show-namespace="false"
      />

      <el-card shadow="never">
        <template #header>
          PV 配置
        </template>

        <div class="grid-three">
          <el-form-item label="accessModes">
            <el-select v-model="localForm.accessModes">
              <el-option label="ReadWriteOnce" value="ReadWriteOnce" />
              <el-option label="ReadOnlyMany" value="ReadOnlyMany" />
              <el-option label="ReadWriteMany" value="ReadWriteMany" />
            </el-select>
          </el-form-item>

          <el-form-item label="storageClassName">
            <el-input v-model="localForm.storageClassName" />
          </el-form-item>

          <el-form-item label="volumeMode">
            <el-select v-model="localForm.volumeMode">
              <el-option label="Filesystem" value="Filesystem" />
              <el-option label="Block" value="Block" />
            </el-select>
          </el-form-item>

          <el-form-item label="capacity.storage">
            <el-input
              v-model="localForm.capacity.storage"
              placeholder="20Gi"
            />
          </el-form-item>

          <el-form-item label="reclaimPolicy">
            <el-select v-model="localForm.persistentVolumeReclaimPolicy">
              <el-option label="Delete" value="Delete" />
              <el-option label="Retain" value="Retain" />
              <el-option label="Recycle" value="Recycle" />
            </el-select>
          </el-form-item>

          <el-form-item label="storageType">
            <el-select
              v-model="localForm.storageType"
              @change="handleStorageTypeChange"
            >
              <el-option label="hostPath" value="hostPath" />
              <el-option label="nfs" value="nfs" />
            </el-select>
          </el-form-item>
        </div>

        <div
          v-if="localForm.storageType === 'hostPath'"
          class="storage-block"
        >
          <el-form-item label="hostPath.path">
            <el-input
              v-model="localForm.hostPath.path"
              placeholder="/mnt/data"
            />
          </el-form-item>
        </div>

        <div
          v-if="localForm.storageType === 'nfs'"
          class="grid-two storage-block"
        >
          <el-form-item label="nfs.server">
            <el-input
              v-model="localForm.nfs.server"
              placeholder="192.168.1.100"
            />
          </el-form-item>

          <el-form-item label="nfs.path">
            <el-input
              v-model="localForm.nfs.path"
              placeholder="/export/data"
            />
          </el-form-item>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { PersistentVolumeFormData } from '@/types/k8s';

import MetadataEditor from '@/components/common/MetadataEditor.vue';

type StorageType = 'hostPath' | 'nfs';

const props = defineProps<{
  modelValue: PersistentVolumeFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PersistentVolumeFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: PersistentVolumeFormData) =>
    emit('update:modelValue', value)
});

const ensureHostPath = () => {
  if (!localForm.value.hostPath) {
    localForm.value.hostPath = {
      path: '/mnt/data'
    };
  }
};

const ensureNfs = () => {
  if (!localForm.value.nfs) {
    localForm.value.nfs = {
      server: '',
      path: '/export/data'
    };
  }
};

const handleStorageTypeChange = (value: StorageType) => {
  if (value === 'hostPath') {
    ensureHostPath();
  }

  if (value === 'nfs') {
    ensureNfs();
  }
};

ensureHostPath();

if (localForm.value.storageType === 'nfs') {
  ensureNfs();
}
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 20px;
}

.grid-three {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 20px 28px;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 20px 28px;
}

.storage-block {
  margin-top: 8px;
}

:deep(.el-input),
:deep(.el-select) {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .grid-three,
  .grid-two {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-three,
  .grid-two {
    grid-template-columns: 1fr;
  }

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