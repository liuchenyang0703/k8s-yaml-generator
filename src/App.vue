<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-block">
        <h1>K8s YAML Generator</h1>
        <p>支持 21 类 Kubernetes 资源的可视化配置、模板套用与 YAML 导出。</p>
      </div>
      <div class="topbar-actions">
        <el-select v-model="store.currentKind" class="kind-select" @change="handleKindChange">
          <el-option v-for="item in resourceList" :key="item.kind" :label="item.title" :value="item.kind" />
        </el-select>
        <el-dropdown @command="applyTemplate">
          <el-button>模板库<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="nginx">Nginx Deployment</el-dropdown-item>
              <el-dropdown-item command="mysql">MySQL StatefulSet</el-dropdown-item>
              <el-dropdown-item command="config">ConfigMap</el-dropdown-item>
              <el-dropdown-item command="ingress">Ingress</el-dropdown-item>
              <el-dropdown-item command="hpa">HPA</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="danger" plain @click="store.resetCurrentForm">重置当前表单</el-button>
      </div>
    </header>

    <main class="layout">
      <section class="center-panel form-host">
        <component :is="currentComponent" v-model="typedCurrentForm" />
      </section>
      <section class="right-panel">
        <YamlPreview :yaml-text="yamlText" :filename="downloadName" />
      </section>
    </main>
    <footer class="site-footer">
      <p>
        联系邮箱：
        <a href="mailto:2162059863@qq.com">2162059863@qq.com</a> | 
        联系公众号：
        <a href="/images/微信公众号.jpeg">小刘Linux</a> | 
        问题反馈：
        <a href="https://github.com/liuchenyang0703/k8s-yaml-generator/discussions">点击跳转</a>
      </p>
      <p class="footer-links">
        版权所有 &copy; 2025 - {{ currentYear }} By
        <a href="https://github.com/liuchenyang0703/" target="_blank" rel="noopener noreferrer">Mr.Liucy</a>
        <span>|</span>
        <span class="record-link">
          <img src="/images/public security.png" alt="" />
          <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备2023037493号</a>
        </span>
        <span>|</span>
        <span class="record-link">
          <img src="https://icp.gov.moe/favicon.ico" alt="" />
          <a href="https://icp.gov.moe/?keyword=20250703" target="_blank" rel="noopener noreferrer">萌ICP备20250703号</a>
        </span>
      </p>
      <div class="footer-badges">
        <a
          v-for="badge in footerBadges"
          :key="badge.src"
          :href="badge.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img :src="badge.src" :alt="badge.alt" />
        </a>
      </div>
    </footer>
    <FloatingFeedbackButton />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FloatingFeedbackButton from '@/components/FloatingFeedbackButton.vue'
import YamlPreview from '@/components/YamlPreview.vue'
const DeploymentForm = defineAsyncComponent(() => import('@/components/resources/DeploymentForm.vue'))
const StatefulSetForm = defineAsyncComponent(() => import('@/components/resources/StatefulSetForm.vue'))
const DaemonSetForm = defineAsyncComponent(() => import('@/components/resources/DaemonSetForm.vue'))
const JobForm = defineAsyncComponent(() => import('@/components/resources/JobForm.vue'))
const CronJobForm = defineAsyncComponent(() => import('@/components/resources/CronJobForm.vue'))
const PodForm = defineAsyncComponent(() => import('@/components/resources/PodForm.vue'))
const ServiceForm = defineAsyncComponent(() => import('@/components/resources/ServiceForm.vue'))
const IngressForm = defineAsyncComponent(() => import('@/components/resources/IngressForm.vue'))
const NetworkPolicyForm = defineAsyncComponent(() => import('@/components/resources/NetworkPolicyForm.vue'))
const ConfigMapForm = defineAsyncComponent(() => import('@/components/resources/ConfigMapForm.vue'))
const SecretForm = defineAsyncComponent(() => import('@/components/resources/SecretForm.vue'))
const PersistentVolumeForm = defineAsyncComponent(() => import('@/components/resources/PersistentVolumeForm.vue'))
const PersistentVolumeClaimForm = defineAsyncComponent(() => import('@/components/resources/PersistentVolumeClaimForm.vue'))
const StorageClassForm = defineAsyncComponent(() => import('@/components/resources/StorageClassForm.vue'))
const ServiceAccountForm = defineAsyncComponent(() => import('@/components/resources/ServiceAccountForm.vue'))
const RoleForm = defineAsyncComponent(() => import('@/components/resources/RoleForm.vue'))
const ClusterRoleForm = defineAsyncComponent(() => import('@/components/resources/ClusterRoleForm.vue'))
const RoleBindingForm = defineAsyncComponent(() => import('@/components/resources/RoleBindingForm.vue'))
const ClusterRoleBindingForm = defineAsyncComponent(() => import('@/components/resources/ClusterRoleBindingForm.vue'))
const HorizontalPodAutoscalerForm = defineAsyncComponent(() => import('@/components/resources/HorizontalPodAutoscalerForm.vue'))
const NamespaceForm = defineAsyncComponent(() => import('@/components/resources/NamespaceForm.vue'))
import { RESOURCE_LIST } from '@/constants/resources'
import { useResourceStore } from '@/stores/resource'
import { useYamlGenerator } from '@/composables/useYamlGenerator'
import {
  createDefaultConfigMap,
  createDefaultDeployment,
  createDefaultHpa,
  createDefaultIngress,
  createDefaultStatefulSet
} from '@/composables/useK8sSchema'
import type { ResourceKind } from '@/types/k8s'

const store = useResourceStore()

onMounted(() => {
  store.restore()
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut)
})

const resourceList = RESOURCE_LIST
const { currentKind, currentForm } = storeToRefs(store)

const typedCurrentForm = computed<any>({
  get: () => currentForm.value,
  set: (value) => {
    store.currentForm = value
  }
})

const componentMap = {
  Deployment: DeploymentForm,
  StatefulSet: StatefulSetForm,
  DaemonSet: DaemonSetForm,
  Job: JobForm,
  CronJob: CronJobForm,
  Pod: PodForm,
  Service: ServiceForm,
  Ingress: IngressForm,
  NetworkPolicy: NetworkPolicyForm,
  ConfigMap: ConfigMapForm,
  Secret: SecretForm,
  PersistentVolume: PersistentVolumeForm,
  PersistentVolumeClaim: PersistentVolumeClaimForm,
  StorageClass: StorageClassForm,
  ServiceAccount: ServiceAccountForm,
  Role: RoleForm,
  ClusterRole: ClusterRoleForm,
  RoleBinding: RoleBindingForm,
  ClusterRoleBinding: ClusterRoleBindingForm,
  HorizontalPodAutoscaler: HorizontalPodAutoscalerForm,
  Namespace: NamespaceForm
} as const

const currentComponent = computed(() => componentMap[currentKind.value])
const { yamlText } = useYamlGenerator(currentKind, typedCurrentForm)
const downloadName = computed(() => (currentForm.value as any)?.metadata?.name || currentKind.value.toLowerCase())
const currentYear = new Date().getFullYear()
const footerBadges = [
  {
    href: 'https://github.com/liuchenyang0703/',
    src: 'https://badgen.net/badge/Github/liuchenyang0703/blue?icon=github',
    alt: 'Github liuchenyang0703'
  },
  {
    href: 'https://github.com/liuchenyang0703/',
    src: 'https://badgen.net/badge/Star/2k%20%E2%AD%90/blue?icon=github',
    alt: 'Star 2k'
  },
  {
    href: 'https://github.com/liuchenyang0703/',
    src: 'https://badgen.net/static/stars/%E2%98%85%E2%98%85%E2%98%85%E2%98%85%E2%98%85?icon=github',
    alt: 'Five stars'
  },
  {
    href: 'https://liuchenyang.top',
    src: 'https://badgen.net/badge/个人网站/ToLiucyLinux/blue',
    alt: '个人网站 ToLiucyLinux'
  }
]
const handleKindChange = (kind: ResourceKind) => store.setKind(kind)

const applyTemplate = (type: string) => {
  if (type === 'nginx') {
    store.setKind('Deployment')
    const deployment = createDefaultDeployment()
    deployment.metadata.name = 'nginx-deployment'
    deployment.metadata.labels = { app: 'nginx' }
    deployment.matchLabels = { app: 'nginx' }
    deployment.podTemplate.labels = { app: 'nginx' }
    deployment.replicas = 1
    deployment.podTemplate.containers[0].name = 'nginx'
    deployment.podTemplate.containers[0].image = 'nginx:1.25'
    deployment.podTemplate.containers[0].ports = [{ name: 'http', containerPort: 80, protocol: 'TCP' }]
    store.replaceCurrentForm(deployment)
  }
  if (type === 'mysql') {
    store.setKind('StatefulSet')
    const statefulSet = createDefaultStatefulSet()
    statefulSet.metadata.name = 'mysql'
    statefulSet.serviceName = 'mysql-headless'
    statefulSet.matchLabels = { app: 'mysql' }
    statefulSet.podTemplate.labels = { app: 'mysql' }
    statefulSet.podTemplate.containers[0].name = 'mysql'
    statefulSet.podTemplate.containers[0].image = 'mysql:8'
    statefulSet.podTemplate.containers[0].env = [
      { name: 'MYSQL_ROOT_PASSWORD', valueFrom: { type: 'value', value: 'changeit' } },
      { name: 'MYSQL_DATABASE', valueFrom: { type: 'value', value: 'appdb' } }
    ]
    statefulSet.volumeClaimTemplates[0].requests.storage = '20Gi'
    store.replaceCurrentForm(statefulSet)
  }
  if (type === 'config') {
    store.setKind('ConfigMap')
    const config = createDefaultConfigMap()
    config.metadata.name = 'app-config'
    config.data = { APP_NAME: 'demo-app', APP_ENV: 'production', LOG_LEVEL: 'info' }
    store.replaceCurrentForm(config)
  }
  if (type === 'ingress') {
    store.setKind('Ingress')
    const ingress = createDefaultIngress()
    ingress.metadata.annotations['nginx.ingress.kubernetes.io/rewrite-target'] = '/'
    ingress.rules[0].host = 'demo.example.com'
    store.replaceCurrentForm(ingress)
  }
  if (type === 'hpa') {
    store.setKind('HorizontalPodAutoscaler')
    const hpa = createDefaultHpa()
    hpa.metadata.name = 'demo-hpa'
    hpa.scaleTargetRef.name = 'nginx-deployment'
    store.replaceCurrentForm(hpa)
  }
  ElMessage.success('模板已应用')
}

const handleShortcut = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    navigator.clipboard.writeText(yamlText.value)
    ElMessage.success('YAML 已复制（Ctrl + Enter）')
  }
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  padding: 16px;
  box-sizing: border-box;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  margin-bottom: 16px;
}

.brand-block {
  min-width: 0;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.15;
}

.topbar p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 16px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  min-width: min(100%, 520px);
}

.kind-select {
  width: 240px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(360px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.center-panel,
.right-panel {
  min-width: 0;
}

.center-panel {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  padding: 18px;
}

.right-panel {
  position: sticky;
  top: 16px;
}

.site-footer {
  margin-top: 18px;
  padding: 14px 22px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #64748b;
  display: grid;
  gap: 4px;
  font-size: 13px;
  line-height: 1.55;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

.site-footer a {
  color: #2563eb;
  text-decoration: none;
}

.site-footer a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.footer-links,
.record-link,
.footer-badges {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.record-link img {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.footer-badges {
  margin-top: 4px;
  gap: 8px;
}

.footer-badges img {
  display: block;
  height: 20px;
}

.form-host :deep(.el-form) {
  --el-form-label-font-size: 14px;
}

.form-host :deep(.el-form-item) {
  margin-bottom: 16px;
}

.form-host :deep(.el-form-item__label) {
  width: auto !important;
  display: inline-flex;
  align-items: center;
  line-height: 1.5;
  white-space: normal;
  text-align: left;
  padding: 0 0 10px !important;
}

.form-host :deep(.el-form-item__label)::after {
  content: '：';
  margin-left: 2px;
}

.form-host :deep(.el-form-item__content) {
  margin-left: 0 !important;
  display: flex;
  align-items: center;
  min-width: 0;
  line-height: normal;
}

.form-host :deep(.el-input),
.form-host :deep(.el-select),
.form-host :deep(.el-input-number),
.form-host :deep(.el-autocomplete),
.form-host :deep(.el-cascader) {
  width: 100%;
}

.form-host :deep(.grid-two),
.form-host :deep(.grid-three),
.form-host :deep(.grid-four),
.form-host :deep(.grid-five) {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.form-host :deep(.grid-two > *),
.form-host :deep(.grid-three > *),
.form-host :deep(.grid-four > *),
.form-host :deep(.grid-five > *) {
  grid-column: span 12;
  min-width: 0;
}

@media (min-width: 768px) {
  .form-host :deep(.grid-two > *) {
    grid-column: span 6;
  }

  .form-host :deep(.grid-three > *) {
    grid-column: span 6;
  }

  .form-host :deep(.grid-four > *) {
    grid-column: span 6;
  }
}

@media (min-width: 1200px) {
  .form-host :deep(.grid-three > *) {
    grid-column: span 4;
  }

  .form-host :deep(.grid-four > *) {
    grid-column: span 3;
  }

  .form-host :deep(.grid-five > *) {
    grid-column: span 4;
  }
}

@media (min-width: 1600px) {
  .form-host :deep(.grid-five > *) {
    grid-column: span 3;
  }
}

@media (max-width: 1280px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .right-panel {
    position: static;
  }
}

@media (max-width: 900px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-actions {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .app-shell {
    padding: 10px;
  }

  .topbar,
  .center-panel,
  .site-footer {
    padding: 14px;
    border-radius: 16px;
  }

  .topbar-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .kind-select,
  .topbar-actions :deep(.el-button),
  .topbar-actions :deep(.el-dropdown) {
    width: 100%;
  }
}
</style>
