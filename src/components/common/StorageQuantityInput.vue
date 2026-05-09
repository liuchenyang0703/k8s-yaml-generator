<template>
  <div class="storage-quantity-input">
    <el-input-number
      v-model="amount"
      :min="0"
      :step="1"
      :controls="false"
    />
    <el-select v-model="unit">
      <el-option
        v-for="item in storageUnits"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type StorageUnit = 'Ki' | 'Mi' | 'Gi' | 'Ti' | 'Pi' | 'Ei';

const storageUnits: StorageUnit[] = ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei'];

const props = withDefaults(defineProps<{
  modelValue?: string
  defaultValue?: string
}>(), {
  modelValue: '',
  defaultValue: '1Gi'
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const parseStorage = (value: string) => {
  const matched = value.trim().match(/^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|Pi|Ei)?$/);

  if (!matched) {
    return parseStorage(props.defaultValue);
  }

  return {
    amount: Number(matched[1]),
    unit: (matched[2] || 'Gi') as StorageUnit
  };
};

const currentValue = computed(() => parseStorage(props.modelValue || props.defaultValue));

const formatStorage = (nextAmount: number | undefined, nextUnit: StorageUnit) => {
  emit('update:modelValue', `${nextAmount ?? 0}${nextUnit}`);
};

const amount = computed({
  get: () => currentValue.value.amount,
  set: (value: number | undefined) => {
    formatStorage(value, currentValue.value.unit);
  }
});

const unit = computed({
  get: () => currentValue.value.unit,
  set: (value: StorageUnit) => {
    formatStorage(currentValue.value.amount, value);
  }
});
</script>

<style scoped>
.storage-quantity-input {
  display: inline-grid;
  grid-template-columns: 65px 63px;
  gap: 6px;
  width: auto;
  max-width: 100%;
}

:deep(.el-input-number),
:deep(.el-select) {
  width: 100%;
}

@media (max-width: 768px) {
  .storage-quantity-input {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 64px;
    width: 100%;
  }
}
</style>
