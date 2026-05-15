<template>
  <div class="form-page">
    <el-form label-width="200px" label-position="left">
      <MetadataEditor
        :model="localForm"
        title="基础配置"
      />

      <el-card shadow="never">
        <template #header>
          PVC 配置
        </template>

        <div class="grid-three">
          <el-form-item label="accessModes">
            <el-select v-model="localForm.accessModes">
              <el-option
                label="ReadWriteOnce"
                value="ReadWriteOnce"
              />
              <el-option
                label="ReadOnlyMany"
                value="ReadOnlyMany"
              />
              <el-option
                label="ReadWriteMany"
                value="ReadWriteMany"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="requests.storage">
            <StorageQuantityInput
              v-model="localForm.requests.storage"
              default-value="10Gi"
            />
          </el-form-item>

          <el-form-item label="storageClassName">
            <el-input v-model="localForm.storageClassName" />
          </el-form-item>

          <el-form-item label="volumeMode">
            <el-select
              v-model="localForm.volumeMode"
              placeholder="默认(Filesystem)"
            >
              <el-option label="默认(Filesystem)" value="Default" />
              <el-option label="Filesystem" value="Filesystem" />
              <el-option label="Block" value="Block" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="selector.matchLabels">
          <KeyValueEditor v-model="localForm.selector.matchLabels" />
        </el-form-item>

        <ArrayEditor
          v-model="localForm.selector.matchExpressions"
          title="matchExpressions"
          :create-item="createMatchExpression"
        >
          <template #default="{ item }">
            <div class="grid-three">
              <el-form-item label="key">
                <el-input v-model="item.key" />
              </el-form-item>

              <el-form-item label="operator">
                <el-select v-model="item.operator">
                  <el-option
                    label="In"
                    value="In"
                  />
                  <el-option
                    label="NotIn"
                    value="NotIn"
                  />
                  <el-option
                    label="Exists"
                    value="Exists"
                  />
                  <el-option
                    label="DoesNotExist"
                    value="DoesNotExist"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="values">
                <StringListEditor v-model="item.values" />
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

import type { PersistentVolumeClaimFormData } from '@/types/k8s';

import { createMatchExpression } from '@/composables/useK8sSchema';

import MetadataEditor from '@/components/common/MetadataEditor.vue';
import KeyValueEditor from '@/components/common/KeyValueEditor.vue';
import ArrayEditor from '@/components/common/ArrayEditor.vue';
import StringListEditor from '@/components/common/StringListEditor.vue';
import StorageQuantityInput from '@/components/common/StorageQuantityInput.vue';

const props = defineProps<{
  modelValue: PersistentVolumeClaimFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PersistentVolumeClaimFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: PersistentVolumeClaimFormData) =>
    emit('update:modelValue', value)
});

if (!localForm.value.volumeMode) {
  localForm.value.volumeMode = 'Default';
}
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 16px;
}

.grid-three {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
</style>
