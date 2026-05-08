<template>
  <div class="form-page">
    <el-form label-width="150px" label-position="left">
      <MetadataEditor
        :model="localForm"
        title="基础配置"
      />

      <el-card shadow="never">
        <template #header>
          Secret 配置
        </template>

        <div class="grid-two">
          <el-form-item label="Type">
            <el-select
              v-model="localForm.type"
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入 Secret 类型"
            >
              <el-option label="Opaque" value="Opaque" />
              <el-option
                label="kubernetes.io/service-account-token"
                value="kubernetes.io/service-account-token"
              />
              <el-option
                label="kubernetes.io/dockercfg"
                value="kubernetes.io/dockercfg"
              />
              <el-option
                label="kubernetes.io/dockerconfigjson"
                value="kubernetes.io/dockerconfigjson"
              />
              <el-option
                label="kubernetes.io/basic-auth"
                value="kubernetes.io/basic-auth"
              />
              <el-option
                label="kubernetes.io/ssh-auth"
                value="kubernetes.io/ssh-auth"
              />
              <el-option
                label="kubernetes.io/tls"
                value="kubernetes.io/tls"
              />
              <el-option
                label="bootstrap.kubernetes.io/token"
                value="bootstrap.kubernetes.io/token"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="只读锁定">
            <el-switch v-model="localForm.immutable" />
          </el-form-item>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          data Base64 数据
        </template>

        <div class="data-editor">
          <div
            v-for="(row, index) in dataRows"
            :key="row.id"
            class="data-row"
          >
            <el-input
              v-model="row.key"
              placeholder="键，例如 password"
              class="data-key"
              @input="syncRowsToForm"
            />

            <el-input
              v-model="row.value"
              type="textarea"
              :rows="5"
              autosize
              placeholder="请输入 Base64 值，支持多行"
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
            新增 data
          </el-button>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          stringData 明文数据
        </template>

        <div class="data-editor">
          <div
            v-for="(row, index) in stringDataRows"
            :key="row.id"
            class="data-row"
          >
            <el-input
              v-model="row.key"
              placeholder="键，例如 username"
              class="data-key"
              @input="syncRowsToForm"
            />

            <el-input
              v-model="row.value"
              type="textarea"
              :rows="5"
              autosize
              placeholder="请输入明文值，支持多行"
              class="data-value"
              @input="syncRowsToForm"
            />

            <el-button
              type="danger"
              plain
              @click="removeStringDataRow(index)"
            >
              删除
            </el-button>
          </div>

          <el-button
            type="primary"
            plain
            @click="addStringDataRow"
          >
            新增 stringData
          </el-button>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { SecretFormData } from '@/types/k8s';

import MetadataEditor from '@/components/common/MetadataEditor.vue';

interface DataRow {
  id: string
  key: string
  value: string
}

const props = defineProps<{
  modelValue: SecretFormData
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SecretFormData]
}>();

const localForm = computed({
  get: () => props.modelValue,
  set: (value: SecretFormData) =>
    emit('update:modelValue', value)
});

const stringDataRows = ref<DataRow[]>([]);
const dataRows = ref<DataRow[]>([]);

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
    stringDataRows.value = objectToRows(value.stringData);
    dataRows.value = objectToRows(value.data);
  },
  {
    immediate: true
  }
);

const syncRowsToForm = () => {
  localForm.value.stringData = rowsToObject(stringDataRows.value);
  localForm.value.data = rowsToObject(dataRows.value);
};

const addStringDataRow = () => {
  stringDataRows.value.push({
    id: createId(),
    key: '',
    value: ''
  });

  syncRowsToForm();
};

const removeStringDataRow = (index: number) => {
  stringDataRows.value.splice(index, 1);
  syncRowsToForm();
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
</script>

<style scoped>
.form-page {
  display: grid;
  gap: 20px;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 20px 28px;
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
:deep(.el-select),
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

@media (max-width: 900px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>