import type { ResourceDefinition, ResourceKind } from '@/types/k8s'

export const RESOURCE_LIST: ResourceDefinition[] = [
  { kind: 'Namespace', apiVersion: 'v1', title: 'Namespace', group: '其他', description: '命名空间隔离。' },
  { kind: 'Pod', apiVersion: 'v1', title: 'Pod', group: '工作负载', description: '独立 Pod 资源。' },
  { kind: 'Deployment', apiVersion: 'apps/v1', title: 'Deployment', group: '工作负载', description: '管理无状态应用副本与滚动升级。' },
  { kind: 'StatefulSet', apiVersion: 'apps/v1', title: 'StatefulSet', group: '工作负载', description: '管理有状态服务与稳定存储。' },
  { kind: 'DaemonSet', apiVersion: 'apps/v1', title: 'DaemonSet', group: '工作负载', description: '确保每个节点运行一个 Pod 副本。' },
  { kind: 'Service', apiVersion: 'v1', title: 'Service', group: '服务发现', description: '将一组 Pod 暴露为稳定网络服务。' },
  { kind: 'Ingress', apiVersion: 'networking.k8s.io/v1', title: 'Ingress', group: '服务发现', description: '声明 HTTP/HTTPS 路由规则。' },
  { kind: 'ConfigMap', apiVersion: 'v1', title: 'ConfigMap', group: '配置存储', description: '保存非敏感配置。' },
  { kind: 'Secret', apiVersion: 'v1', title: 'Secret', group: '配置存储', description: '保存敏感配置。' },
  { kind: 'PersistentVolume', apiVersion: 'v1', title: 'PersistentVolume', group: '存储', description: '集群级持久化存储资源。' },
  { kind: 'PersistentVolumeClaim', apiVersion: 'v1', title: 'PersistentVolumeClaim', group: '存储', description: '声明式申请持久化存储。' },
  { kind: 'Job', apiVersion: 'batch/v1', title: 'Job', group: '工作负载', description: '执行一次性任务。' },
  { kind: 'CronJob', apiVersion: 'batch/v1', title: 'CronJob', group: '工作负载', description: '按 Cron 表达式周期性执行任务。' },
  { kind: 'NetworkPolicy', apiVersion: 'networking.k8s.io/v1', title: 'NetworkPolicy', group: '服务发现', description: '控制 Pod 入站与出站访问。' },
  { kind: 'ServiceAccount', apiVersion: 'v1', title: 'ServiceAccount', group: 'RBAC', description: 'Pod 身份与凭据挂载控制。' },
  { kind: 'Role', apiVersion: 'rbac.authorization.k8s.io/v1', title: 'Role', group: 'RBAC', description: '命名空间内权限规则。' },
  { kind: 'ClusterRole', apiVersion: 'rbac.authorization.k8s.io/v1', title: 'ClusterRole', group: 'RBAC', description: '集群范围权限规则。' },
  { kind: 'RoleBinding', apiVersion: 'rbac.authorization.k8s.io/v1', title: 'RoleBinding', group: 'RBAC', description: '将角色绑定给主体。' },
  { kind: 'ClusterRoleBinding', apiVersion: 'rbac.authorization.k8s.io/v1', title: 'ClusterRoleBinding', group: 'RBAC', description: '将集群角色绑定给主体。' },
  { kind: 'HorizontalPodAutoscaler', apiVersion: 'autoscaling/v2', title: 'HorizontalPodAutoscaler', group: '自动伸缩', description: '根据指标自动伸缩副本。' },
]

export const RESOURCE_KIND_OPTIONS: ResourceKind[] = RESOURCE_LIST.map((item) => item.kind)

export const COMMON_IMAGE_SUGGESTIONS = ['nginx:1.25', 'redis:7', 'mysql:8', 'busybox:1.36', 'node:20-alpine', 'openjdk:17-jdk']
export const COMMON_ENV_SUGGESTIONS = ['PORT', 'NODE_ENV', 'TZ', 'JAVA_OPTS', 'SPRING_PROFILES_ACTIVE']
export const COMMON_ANNOTATION_SUGGESTIONS = [
  'nginx.ingress.kubernetes.io/rewrite-target',
  'nginx.ingress.kubernetes.io/proxy-body-size',
  'nginx.ingress.kubernetes.io/ssl-redirect',
  'prometheus.io/scrape',
  'prometheus.io/port'
]
export const COMMON_ROLE_VERBS = ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
export const COMMON_ACCESS_MODES = ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany']
