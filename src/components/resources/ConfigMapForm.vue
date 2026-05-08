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

        <el-form-item label="只读锁定">
          <el-switch v-model="localForm.immutable" />
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

      <el-card shadow="never">
        <template #header>
          文本数据
        </template>

        <div class="data-editor">
          <div
            v-for="(row, index) in dataRows"
            :key="row.id"
            class="data-row"
          >
            <el-input
              v-model="row.key"
              placeholder="配置 配置文件名"
              class="data-key"
              @input="syncRowsToForm"
            />

            <el-input
              v-model="row.value"
              type="textarea"
              :rows="10"
              autosize
              placeholder="请输入配置内容（支持多行）"
              class="data-value"
              @input="syncRowsToForm"
            />

            <el-button
              type="danger"
              plain
              @click="removeDataRow(index)"
            >
              删除
            </el-button>
          </div>

          <el-button
            type="primary"
            plain
            @click="addDataRow"
          >
            新增文本数据
          </el-button>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          二进制数据
        </template>

        <div class="data-editor">
          <div
            v-for="(row, index) in binaryDataRows"
            :key="row.id"
            class="data-row"
          >
            <el-input
              v-model="row.key"
              placeholder="二进制键"
              class="data-key"
              @input="syncRowsToForm"
            />

            <el-input
              v-model="row.value"
              type="textarea"
              :rows="6"
              autosize
              placeholder="请输入 Base64 值"
              class="data-value"
              @input="syncRowsToForm"
            />

            <el-button
              type="danger"
              plain
              @click="removeBinaryDataRow(index)"
            >
              删除
            </el-button>
          </div>

          <el-button
            type="primary"
            plain
            @click="addBinaryDataRow"
          >
            新增二进制数据
          </el-button>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { ConfigMapFormData } from '@/types/k8s';

import KeyValueEditor from '@/components/common/KeyValueEditor.vue';

interface DataRow {
  id: string
  key: string
  value: string
}

const props = defineProps<{
  modelValue: ConfigMapFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ConfigMapFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: ConfigMapFormData) =>
    emit('update:modelValue', value)
});

const dataRows = ref<DataRow[]>([]);
const binaryDataRows = ref<DataRow[]>([]);

const createId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const objectToRows = (data: Record<string, string> = {}) =>
  Object.entries(data).map(([key, value]) => ({
    id: createId(),
    key,
    value
  }));

const rowsToObject = (rows: DataRow[]) => {
  const result: Record<string, string> = {};

  rows.forEach(row => {
    const key = row.key.trim();

    if (key) {
      result[key] = row.value;
    }
  });

  return result;
};

watch(
  () => props.modelValue,
  value => {
    dataRows.value = objectToRows(value.data);
    binaryDataRows.value = objectToRows(value.binaryData);
  },
  {
    immediate: true
  }
);

const syncRowsToForm = () => {
  localForm.value.data = rowsToObject(dataRows.value);
  localForm.value.binaryData = rowsToObject(binaryDataRows.value);
};

const addDataRow = () => {
  dataRows.value.push({
    id: createId(),
    key: '',
    value: ''
  });

  syncRowsToForm();
};

const removeDataRow = (index: number) => {
  dataRows.value.splice(index, 1);
  syncRowsToForm();
};

const addBinaryDataRow = () => {
  binaryDataRows.value.push({
    id: createId(),
    key: '',
    value: ''
  });

  syncRowsToForm();
};

const removeBinaryDataRow = (index: number) => {
  binaryDataRows.value.splice(index, 1);
  syncRowsToForm();
};
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 20px;
}

.data-editor {
  display: grid;
  gap: 20px;
}

.data-row {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(420px, 1fr) auto;
  align-items: start;
  gap: 16px;
}

.data-key,
.data-value {
  width: 100%;
}

:deep(.el-input),
:deep(.el-textarea) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: Consolas, Monaco, "Courier New", monospace;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 1200px) {
  .data-row {
    grid-template-columns: 1fr;
  }
}
</style>