<template>
  <el-card shadow="never">
    <template #header>{{ title }}</template>
    <div class="grid-two">
      <el-form-item label="名称" required>
        <el-input v-model="model.metadata.name" placeholder="例如 demo-app" />
      </el-form-item>
      <el-form-item v-if="showNamespace" label="命名空间">
        <el-input v-model="model.metadata.namespace" placeholder="default" />
      </el-form-item>
    </div>
    <el-form-item label="元数据标签">
      <KeyValueEditor v-model="model.metadata.labels" key-placeholder="标签键" value-placeholder="标签值" />
    </el-form-item>
    <el-form-item label="元数据注解">
      <KeyValueEditor v-model="model.metadata.annotations" key-placeholder="注解键" value-placeholder="注解值" />
    </el-form-item>
  </el-card>
</template>

<script setup lang="ts">
import KeyValueEditor from './KeyValueEditor.vue'
withDefaults(defineProps<{ model: any; title?: string; showNamespace?: boolean }>(), { title: '基础配置', showNamespace: true })
</script>

<style scoped>
.grid-two { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px }
</style>
