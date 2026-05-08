export type KeyValueMap = Record<string, string>

export interface Metadata {
  name: string
  namespace?: string
  labels: KeyValueMap
  annotations: KeyValueMap
}

export interface LabelSelector {
  matchLabels: KeyValueMap
}

export interface MatchExpression {
  key: string
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist'
  values?: string[]
}

export interface ResourceRequirement {
  cpu?: string
  memory?: string
  storage?: string
}

export interface ContainerPort {
  name?: string
  containerPort: number
  protocol?: 'TCP' | 'UDP' | 'SCTP'
}

export interface ValueFromRef {
  type: 'value' | 'configMapKeyRef' | 'secretKeyRef' | 'fieldRef'
  value?: string
  name?: string
  key?: string
  fieldPath?: string
}

export interface EnvVar {
  name: string
  valueFrom: ValueFromRef
}

export interface VolumeMount {
  name: string
  mountPath: string
  subPath?: string
  readOnly?: boolean
}

export interface VolumeConfig {
  name: string
  type: 'emptyDir' | 'configMap' | 'secret' | 'persistentVolumeClaim'
  sourceName?: string
  claimName?: string
}

export interface HttpGetProbe {
  path: string
  port: number | string
}

export interface ProbeConfig {
  type: 'httpGet' | 'tcpSocket' | 'exec'
  httpGet?: HttpGetProbe
  tcpSocketPort?: number
  execCommand?: string
  initialDelaySeconds?: number
  periodSeconds?: number
}

export interface SecurityContextConfig {
  privileged?: boolean
}

export interface ContainerConfig {
  name: string
  image: string
  imagePullPolicy?: 'Always' | 'Never' | 'IfNotPresent'
  ports: ContainerPort[]
  env: EnvVar[]
  volumeMounts: VolumeMount[]
  resourcesEnabled?: boolean
  resources: {
    requests: ResourceRequirement
    limits: ResourceRequirement
  }
  probeEnabled?: boolean
  livenessProbe?: ProbeConfig
  readinessProbe?: ProbeConfig
  securityContext: SecurityContextConfig
}

export interface TolerationConfig {
  key?: string
  operator?: 'Equal' | 'Exists'
  value?: string
  effect?: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute'
  tolerationSeconds?: number
}

export interface PodTemplateSpecConfig {
  labels: KeyValueMap
  annotations: KeyValueMap
  hostNetwork?: boolean
  nodeName?: string
  restartPolicy?: 'Always' | 'OnFailure' | 'Never'
  terminationGracePeriodSeconds?: number
  serviceAccountName?: string
  containers: ContainerConfig[]
  volumes: VolumeConfig[]
  tolerations: TolerationConfig[]
}

export interface WorkloadCommonForm {
  metadata: Metadata
  replicas?: number
  matchLabels: KeyValueMap
  podTemplate: PodTemplateSpecConfig
}

export interface DeploymentFormData extends WorkloadCommonForm {
  strategy: {
    type: 'RollingUpdate' | 'Recreate'
    maxSurge?: string
    maxUnavailable?: string
  }
}

export interface StatefulSetFormData extends WorkloadCommonForm {
  serviceName: string
  podManagementPolicy?: 'OrderedReady' | 'Parallel'
  strategy: {
    type?: 'RollingUpdate' | 'OnDelete'
    partition?: number
  }
  volumeClaimTemplates: VolumeClaimTemplate[]
}

export interface DaemonSetFormData extends WorkloadCommonForm {
  updateStrategy?: 'RollingUpdate' | 'OnDelete'
  maxUnavailable?: string
  minReadySeconds?: number
}

export interface JobFormData {
  metadata: Metadata
  completions?: number
  parallelism?: number
  backoffLimit?: number
  activeDeadlineSeconds?: number
  ttlSecondsAfterFinished?: number
  podTemplate: PodTemplateSpecConfig
}

export interface CronJobFormData extends JobFormData {
  schedule: string
  startingDeadlineSeconds?: number
  concurrencyPolicy: 'Allow' | 'Forbid' | 'Replace'
  successfulJobHistoryLimit?: number
  failedJobHistoryLimit?: number
}

export interface PodFormData {
  metadata: Metadata
  podTemplate: PodTemplateSpecConfig
}

export interface ServicePort {
  name?: string
  port: number
  targetPort?: number | string
  nodePort?: number
  protocol?: 'TCP' | 'UDP' | 'SCTP'
}

export interface ServiceFormData {
  metadata: Metadata
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName'
  selector: KeyValueMap
  clusterIP?: string
  externalName?: string
  sessionAffinity: 'None' | 'ClientIP'
  externalTrafficPolicy?: 'Cluster' | 'Local'
  ports: ServicePort[]
}

export interface IngressPath {
  path: string
  pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific'
  serviceName: string
  servicePort?: number
  servicePortName?: string
}

export interface IngressRuleForm {
  host: string
  paths: IngressPath[]
}

export interface IngressTlsForm {
  hosts: string[]
  secretName: string
}

export interface IngressFormData {
  metadata: Metadata
  ingressClassName?: string
  rules: IngressRuleForm[]
  tls: IngressTlsForm[]
}

export interface NetworkPeer {
  peerType: 'podSelector' | 'namespaceSelector' | 'ipBlock'
  labels: KeyValueMap
  cidr?: string
  except: string[]
}

export interface NetworkPort {
  port: number
  protocol: 'TCP' | 'UDP' | 'SCTP'
}

export interface NetworkRule {
  peers: NetworkPeer[]
  ports: NetworkPort[]
}

export interface NetworkPolicyFormData {
  metadata: Metadata
  podSelector: KeyValueMap
  policyTypes: Array<'Ingress' | 'Egress'>
  ingress: NetworkRule[]
  egress: NetworkRule[]
}

export interface ConfigMapFormData {
  metadata: Metadata
  immutable: boolean
  data: KeyValueMap
  binaryData: KeyValueMap
}

export interface SecretFormData {
  metadata: Metadata
  type: string
  immutable: boolean
  stringData: KeyValueMap
  data: KeyValueMap
}

export interface PersistentVolumeClaimFormData {
  metadata: Metadata
  accessModes: Array<'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany'>
  storageClassName?: string
  volumeMode: 'Filesystem' | 'Block'
  requests: ResourceRequirement
  limits: ResourceRequirement
  selector: {
    matchLabels: KeyValueMap
    matchExpressions: MatchExpression[]
  }
}

export interface ServiceAccountFormData {
  metadata: Metadata
  automountServiceAccountToken: boolean
  imagePullSecrets: Array<{ name: string }>
  secrets: Array<{ name: string }>
}

export interface PolicyRuleForm {
  apiGroups: string[]
  resources: string[]
  verbs: string[]
  resourceNames: string[]
  nonResourceURLs: string[]
}

export interface RoleFormData {
  metadata: Metadata
  rules: PolicyRuleForm[]
}

export interface ClusterRoleFormData {
  metadata: Metadata
  rules: PolicyRuleForm[]
}

export interface SubjectForm {
  kind: 'User' | 'Group' | 'ServiceAccount'
  name: string
  namespace?: string
}

export interface RoleBindingFormData {
  metadata: Metadata
  roleRef: {
    apiGroup: string
    kind: 'Role' | 'ClusterRole'
    name: string
  }
  subjects: SubjectForm[]
}

export interface ClusterRoleBindingFormData {
  metadata: Metadata
  roleRef: {
    apiGroup: string
    kind: 'Role' | 'ClusterRole'
    name: string
  }
  subjects: SubjectForm[]
}

export interface HPAMetricForm {
  type: 'Resource' | 'Custom' | 'Pods' | 'Object' | 'External'
  resourceName?: string
  targetType?: 'Utilization' | 'AverageValue' | 'Value'
  averageUtilization?: number
  averageValue?: string
}

export interface HPABehaviorPolicy {
  type: 'Pods' | 'Percent'
  value: number
  periodSeconds: number
}

export interface HorizontalPodAutoscalerFormData {
  metadata: Metadata
  scaleTargetRef: {
    apiVersion: string
    kind: string
    name: string
  }
  minReplicas?: number
  maxReplicas: number
  metrics: HPAMetricForm[]
  behavior: {
    scaleDownSelectPolicy: 'Max' | 'Min' | 'Disabled'
    scaleDownPolicies: HPABehaviorPolicy[]
  }
}

export interface NamespaceFormData {
  metadata: Metadata
  finalizers: string[]
}

export interface VolumeClaimTemplate {
  metadata: { name: string; labels: KeyValueMap }
  storageClassName?: string
  accessModes: Array<'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany'>
  requests: ResourceRequirement
}

export type ResourceKind =
  | 'Deployment'
  | 'StatefulSet'
  | 'DaemonSet'
  | 'Job'
  | 'CronJob'
  | 'Service'
  | 'Ingress'
  | 'NetworkPolicy'
  | 'ConfigMap'
  | 'Secret'
  | 'PersistentVolumeClaim'
  | 'ServiceAccount'
  | 'Role'
  | 'ClusterRole'
  | 'RoleBinding'
  | 'ClusterRoleBinding'
  | 'HorizontalPodAutoscaler'
  | 'Namespace'
  | 'Pod'

export type ResourceFormUnion =
  | DeploymentFormData
  | StatefulSetFormData
  | DaemonSetFormData
  | JobFormData
  | CronJobFormData
  | ServiceFormData
  | IngressFormData
  | NetworkPolicyFormData
  | ConfigMapFormData
  | SecretFormData
  | PersistentVolumeClaimFormData
  | ServiceAccountFormData
  | RoleFormData
  | ClusterRoleFormData
  | RoleBindingFormData
  | ClusterRoleBindingFormData
  | HorizontalPodAutoscalerFormData
  | NamespaceFormData
  | PodFormData

export interface ResourceDefinition {
  kind: ResourceKind
  apiVersion: string
  title: string
  group: string
  description: string
}
