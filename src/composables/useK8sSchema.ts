import type {
  ClusterRoleBindingFormData,
  ClusterRoleFormData,
  ConfigMapFormData,
  ContainerConfig,
  ContainerPort,
  CronJobFormData,
  DaemonSetFormData,
  DeploymentFormData,
  EnvVar,
  HPABehaviorPolicy,
  HPAMetricForm,
  HorizontalPodAutoscalerFormData,
  IngressFormData,
  JobFormData,
  KeyValueMap,
  MatchExpression,
  NamespaceFormData,
  NetworkPolicyFormData,
  PersistentVolumeFormData,
  PersistentVolumeClaimFormData,
  PodFormData,
  PolicyRuleForm,
  ResourceFormUnion,
  ResourceKind,
  RoleBindingFormData,
  RoleFormData,
  SecretFormData,
  ServiceAccountFormData,
  ServiceFormData,
  ServicePort,
  StatefulSetFormData,
  SubjectForm,
  VolumeClaimTemplate,
  VolumeConfig,
  VolumeMount,
  TolerationConfig,
  ProbeConfig
} from '@/types/k8s'

const createMetadata = (name = '') => ({
  name,
  namespace: 'default',
  labels: {} as KeyValueMap,
  annotations: {} as KeyValueMap
})

export const createPort = (): ContainerPort => ({ name: '', containerPort: 80, protocol: 'TCP' })
export const createEnv = (): EnvVar => ({ name: '', valueFrom: { type: 'value', value: '' } })
export const createVolumeMount = (): VolumeMount => ({ name: '', mountPath: '', subPath: '', readOnly: false })
export const createVolume = (): VolumeConfig => ({ name: 'data', type: 'emptyDir', sourceName: '' })
export const createToleration = (): TolerationConfig => ({ key: '', operator: 'Equal', value: '', effect: 'NoSchedule', tolerationSeconds: 0 })
export const createProbe = (): ProbeConfig => ({ type: 'httpGet', httpGet: { path: '/', port: 80 }, tcpSocketPort: 80, execCommand: '', initialDelaySeconds: 10, periodSeconds: 10 })
export const createContainer = (): ContainerConfig => ({
  name: 'app',
  image: 'nginx:1.25',
  imagePullPolicy: 'IfNotPresent',
  ports: [createPort()],
  env: [],
  volumeMounts: [],
  resourcesEnabled: false,
  resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '500m', memory: '512Mi' } },
  probeEnabled: false,
  livenessProbe: createProbe(),
  readinessProbe: createProbe(),
  securityContext: { privileged: false }
})
export const createPodTemplate = (restartPolicy: 'Always' | 'OnFailure' | 'Never' = 'Always') => ({
  labels: {},
  annotations: {},
  hostNetwork: false,
  restartPolicy,
  terminationGracePeriodSeconds: 30,
  serviceAccountName: '',
  containers: [createContainer()],
  volumes: [] as VolumeConfig[],
  tolerations: [] as TolerationConfig[]
})
export const createServicePort = (): ServicePort => ({ name: '', port: 80, targetPort: 80, protocol: 'TCP' })
export const createMatchExpression = (): MatchExpression => ({ key: '', operator: 'In', values: [] })
export const createPolicyRule = (): PolicyRuleForm => ({ apiGroups: [''], resources: ['pods'], verbs: ['get', 'list'], resourceNames: [], nonResourceURLs: [] })
export const createSubject = (): SubjectForm => ({ kind: 'ServiceAccount', name: '', namespace: 'default' })
export const createHpaMetric = (): HPAMetricForm => ({ type: 'Resource', resourceName: 'cpu', targetType: 'Utilization', averageUtilization: 80 })
export const createHpaPolicy = (): HPABehaviorPolicy => ({ type: 'Percent', value: 100, periodSeconds: 15 })
export const createVolumeClaimTemplate = (): VolumeClaimTemplate => ({ metadata: { name: 'data', labels: {} }, storageClassName: '', accessModes: 'ReadWriteOnce', requests: { storage: '10Gi' } })

export const createDefaultDeployment = (): DeploymentFormData => ({
  metadata: createMetadata('demo-deployment'),
  replicas: 1,
  matchLabels: { app: 'demo' },
  strategy: { type: 'RollingUpdate', maxSurge: '25%', maxUnavailable: '25%' },
  podTemplate: { ...createPodTemplate('Always'), labels: { app: 'demo' } }
})

export const createDefaultStatefulSet = (): StatefulSetFormData => ({
  metadata: createMetadata('demo-statefulset'),
  replicas: 1,
  serviceName: 'demo-headless',
  matchLabels: { app: 'demo' },
  podManagementPolicy: 'OrderedReady',
  strategy: { type: 'RollingUpdate', partition: 0 },
  volumeClaimTemplates: [createVolumeClaimTemplate()],
  podTemplate: { ...createPodTemplate('Always'), labels: { app: 'demo' } }
})

export const createDefaultDaemonSet = (): DaemonSetFormData => ({
  metadata: createMetadata('demo-daemonset'),
  matchLabels: { app: 'demo' },
  updateStrategy: 'RollingUpdate',
  maxUnavailable: '1',
  minReadySeconds: 0,
  podTemplate: { ...createPodTemplate('Always'), labels: { app: 'demo' } }
})

export const createDefaultJob = (): JobFormData => ({
  metadata: createMetadata('demo-job'),
  completions: 1,
  parallelism: 1,
  backoffLimit: 6,
  activeDeadlineSeconds: undefined,
  ttlSecondsAfterFinished: 300,
  podTemplate: createPodTemplate('OnFailure')
})

export const createDefaultCronJob = (): CronJobFormData => ({
  ...createDefaultJob(),
  metadata: createMetadata('demo-cronjob'),
  schedule: '*/5 * * * *',
  startingDeadlineSeconds: 30,
  concurrencyPolicy: 'Forbid',
  successfulJobHistoryLimit: 3,
  failedJobHistoryLimit: 1
})

export const createDefaultPod = (): PodFormData => ({
  metadata: createMetadata('demo-pod'),
  podTemplate: createPodTemplate('Always')
})

export const createDefaultService = (): ServiceFormData => ({
  metadata: createMetadata('demo-service'),
  type: 'ClusterIP',
  selector: { app: 'demo' },
  clusterIP: '',
  externalName: '',
  sessionAffinity: '',
  ports: [createServicePort()]
})

export const createDefaultIngress = (): IngressFormData => ({
  metadata: createMetadata('demo-ingress'),
  ingressClassName: 'nginx',
  rules: [{ host: '', paths: [{ path: '/', pathType: 'Prefix', serviceName: 'demo-service', servicePort: 80, servicePortName: '' }] }],
  tls: []
})

export const createDefaultNetworkPolicy = (): NetworkPolicyFormData => ({
  metadata: createMetadata('demo-network-policy'),
  podSelector: { app: 'demo' },
  policyTypes: ['Ingress'],
  ingress: [{ peers: [{ peerType: 'namespaceSelector', labels: {}, cidr: '', except: [] }], ports: [{ port: 80, protocol: 'TCP' }] }],
  egress: []
})

export const createDefaultConfigMap = (): ConfigMapFormData => ({ metadata: createMetadata('demo-configmap'), immutable: false, data: { APP_NAME: 'demo' }, binaryData: {} })
export const createDefaultSecret = (): SecretFormData => ({ metadata: createMetadata('demo-secret'), type: 'Opaque', immutable: false,data: {}, stringData: {}  })
export const createDefaultPersistentVolume = (): PersistentVolumeFormData => ({ metadata: createMetadata('demo-pv'), accessModes: 'ReadWriteOnce', storageClassName: '', volumeMode: 'Filesystem', capacity: { storage: '20Gi' }, persistentVolumeReclaimPolicy: 'Retain', storageType: 'hostPath', hostPath: { path: '/mnt/data' }, nfs: { server: '', path: '/export/data' } })
export const createDefaultPersistentVolumeClaim = (): PersistentVolumeClaimFormData => ({ metadata: createMetadata('demo-pvc'), accessModes: 'ReadWriteOnce', storageClassName: '', volumeMode: 'Filesystem', requests: { storage: '10Gi' }, limits: {}, selector: { matchLabels: {}, matchExpressions: [] } })
export const createDefaultServiceAccount = (): ServiceAccountFormData => ({ metadata: createMetadata('demo-sa'), automountServiceAccountToken: true, imagePullSecrets: [], secrets: [] })
export const createDefaultRole = (): RoleFormData => ({ metadata: createMetadata('demo-role'), rules: [createPolicyRule()] })
export const createDefaultClusterRole = (): ClusterRoleFormData => ({ metadata: { name: 'demo-cluster-role', labels: {}, annotations: {} }, rules: [createPolicyRule()] })
export const createDefaultRoleBinding = (): RoleBindingFormData => ({ metadata: createMetadata('demo-rolebinding'), roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'Role', name: 'demo-role' }, subjects: [createSubject()] })
export const createDefaultClusterRoleBinding = (): ClusterRoleBindingFormData => ({ metadata: { name: 'demo-clusterrolebinding', labels: {}, annotations: {} }, roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: 'demo-cluster-role' }, subjects: [createSubject()] })
export const createDefaultHpa = (): HorizontalPodAutoscalerFormData => ({ metadata: createMetadata('demo-hpa'), scaleTargetRef: { apiVersion: 'apps/v1', kind: 'Deployment', name: 'demo-deployment' }, minReplicas: 1, maxReplicas: 5, metrics: [createHpaMetric()], behavior: { scaleDownSelectPolicy: 'Max', scaleDownPolicies: [createHpaPolicy()] } })
export const createDefaultNamespace = (): NamespaceFormData => ({ metadata: { name: 'demo', labels: {}, annotations: {} }, finalizers: [] })

export const createDefaultResourceByKind = (kind: ResourceKind): ResourceFormUnion => {
  switch (kind) {
    case 'Deployment': return createDefaultDeployment()
    case 'StatefulSet': return createDefaultStatefulSet()
    case 'DaemonSet': return createDefaultDaemonSet()
    case 'Job': return createDefaultJob()
    case 'CronJob': return createDefaultCronJob()
    case 'Service': return createDefaultService()
    case 'Ingress': return createDefaultIngress()
    case 'NetworkPolicy': return createDefaultNetworkPolicy()
    case 'ConfigMap': return createDefaultConfigMap()
    case 'Secret': return createDefaultSecret()
    case 'PersistentVolume': return createDefaultPersistentVolume()
    case 'PersistentVolumeClaim': return createDefaultPersistentVolumeClaim()
    case 'ServiceAccount': return createDefaultServiceAccount()
    case 'Role': return createDefaultRole()
    case 'ClusterRole': return createDefaultClusterRole()
    case 'RoleBinding': return createDefaultRoleBinding()
    case 'ClusterRoleBinding': return createDefaultClusterRoleBinding()
    case 'HorizontalPodAutoscaler': return createDefaultHpa()
    case 'Namespace': return createDefaultNamespace()
    case 'Pod': return createDefaultPod()
  }
}
