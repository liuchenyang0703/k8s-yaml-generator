import { computed, type Ref } from 'vue'
import type {
  ClusterRoleBindingFormData,
  ClusterRoleFormData,
  ConfigMapFormData,
  CronJobFormData,
  DaemonSetFormData,
  DeploymentFormData,
  HorizontalPodAutoscalerFormData,
  IngressFormData,
  JobFormData,
  NamespaceFormData,
  NetworkPolicyFormData,
  PersistentVolumeFormData,
  PersistentVolumeClaimFormData,
  PodFormData,
  ResourceFormUnion,
  ResourceKind,
  RoleBindingFormData,
  RoleFormData,
  SecretFormData,
  ServiceAccountFormData,
  ServiceFormData,
  StorageClassFormData,
  StatefulSetFormData
} from '@/types/k8s'
import { toYaml } from '@/utils/yamlHelper'

const envToManifest = (env: any) => {
  if (env.valueFrom.type === 'value') return { name: env.name, value: env.valueFrom.value }
  if (env.valueFrom.type === 'fieldRef') return { name: env.name, valueFrom: { fieldRef: { fieldPath: env.valueFrom.fieldPath } } }
  return { name: env.name, valueFrom: { [env.valueFrom.type]: { name: env.valueFrom.name, key: env.valueFrom.key } } }
}
const volumeToManifest = (volume: any) => {
  if (volume.type === 'hostPath') return { name: volume.name, hostPath: { path: volume.hostPath, type: volume.hostPathType || undefined } }
  if (volume.type === 'configMap') return { name: volume.name, configMap: { name: volume.sourceName } }
  if (volume.type === 'secret') return { name: volume.name, secret: { secretName: volume.sourceName } }
  if (volume.type === 'persistentVolumeClaim') return { name: volume.name, persistentVolumeClaim: { claimName: volume.claimName || volume.sourceName } }
  return { name: volume.name, emptyDir: {} }
}
const probeToManifest = (probe: any) => {
  if (!probe) return undefined
  const base: any = {}
  if (probe.initialDelaySeconds !== undefined) base.initialDelaySeconds = probe.initialDelaySeconds
  if (probe.periodSeconds !== undefined) base.periodSeconds = probe.periodSeconds

  if (probe.type === 'httpGet' && probe.httpGet?.path !== undefined && probe.httpGet?.port !== undefined) {
    base.httpGet = { path: probe.httpGet.path, port: probe.httpGet.port }
  } else if (probe.type === 'tcpSocket' && probe.tcpSocketPort !== undefined) {
    base.tcpSocket = { port: probe.tcpSocketPort }
  } else if (probe.type === 'exec' && probe.execCommand) {
    base.exec = { command: probe.execCommand.split(' ').filter(Boolean) }
  }

  return Object.keys(base).length > 0 ? base : undefined
}

const podSpec = (podTemplate: any) => ({
  ...(podTemplate.hostNetwork !== undefined ? { hostNetwork: podTemplate.hostNetwork } : {}),
  ...(podTemplate.nodeName ? { nodeName: podTemplate.nodeName } : {}),
  ...(podTemplate.serviceAccountName ? { serviceAccountName: podTemplate.serviceAccountName } : {}),
  ...(podTemplate.restartPolicy ? { restartPolicy: podTemplate.restartPolicy } : {}),
  ...(podTemplate.terminationGracePeriodSeconds > 0 ? { terminationGracePeriodSeconds: podTemplate.terminationGracePeriodSeconds } : {}),
  tolerations: podTemplate.tolerations?.map((item: any) => ({
    key: item.key || undefined,
    operator: item.operator,
    value: item.operator === 'Exists' ? undefined : item.value,
    effect: item.effect || undefined,
    tolerationSeconds: item.effect === 'NoExecute' && item.tolerationSeconds > 0 ? item.tolerationSeconds : undefined
  })),
  containers: podTemplate.containers.map((container: any) => ({
    name: container.name,
    image: container.image,
    imagePullPolicy: container.imagePullPolicy,
    command: container.command?.filter((item: string) => item.trim()),
    ports: container.ports.map((port: any) => ({ name: port.name, containerPort: port.containerPort, protocol: port.protocol })),
    env: container.env.map(envToManifest),
    volumeMounts: container.volumeMounts.map((mount: any) => ({ name: mount.name, mountPath: mount.mountPath, subPath: mount.subPath || undefined, readOnly: mount.readOnly })), 
    ...(container.resourcesEnabled ? { resources: container.resources } : {}),
    ...(container.securityContext?.privileged ? { securityContext: { privileged: container.securityContext.privileged } } : {}),
    ...(container.probeEnabled ? {
      livenessProbe: probeToManifest(container.livenessProbe),
      readinessProbe: probeToManifest(container.readinessProbe)
    } : {})
  })),
  volumes: podTemplate.volumes?.map(volumeToManifest)
})

const buildDeployment = (form: DeploymentFormData) => ({
  apiVersion: 'apps/v1', kind: 'Deployment', metadata: form.metadata,
  spec: { replicas: form.replicas, selector: { matchLabels: form.matchLabels }, strategy: form.strategy.type ? { type: form.strategy.type, rollingUpdate: form.strategy.type === 'RollingUpdate' ? { maxSurge: form.strategy.maxSurge, maxUnavailable: form.strategy.maxUnavailable } : undefined } : undefined, template: { metadata: { labels: form.podTemplate.labels, annotations: form.podTemplate.annotations }, spec: podSpec(form.podTemplate) } }
})
const buildStatefulSet = (form: StatefulSetFormData) => ({
  apiVersion: 'apps/v1', kind: 'StatefulSet', metadata: form.metadata,
  spec: { serviceName: form.serviceName, replicas: form.replicas, selector: { matchLabels: form.matchLabels }, ...(form.podManagementPolicy ? { podManagementPolicy: form.podManagementPolicy } : {}), ...(form.strategy.type ? { updateStrategy: { type: form.strategy.type, rollingUpdate: form.strategy.type === 'RollingUpdate' ? { partition: form.strategy.partition } : undefined } } : {}), volumeClaimTemplates: form.volumeClaimTemplates.map((v) => ({ metadata: v.metadata, spec: { accessModes: [v.accessModes], storageClassName: v.storageClassName, resources: { requests: { storage: v.requests.storage } } } })), template: { metadata: { labels: form.podTemplate.labels, annotations: form.podTemplate.annotations }, spec: podSpec(form.podTemplate) } }
})
const buildDaemonSet = (form: DaemonSetFormData) => ({apiVersion: 'apps/v1', kind: 'DaemonSet', metadata: form.metadata, spec: { minReadySeconds: form.minReadySeconds, selector: { matchLabels: form.matchLabels }, ...(form.updateStrategy ? { updateStrategy: { type: form.updateStrategy, rollingUpdate: form.updateStrategy === 'RollingUpdate' ? { maxUnavailable: form.maxUnavailable } : undefined } } : {}), template: { metadata: { labels: form.podTemplate.labels, annotations: form.podTemplate.annotations }, spec: podSpec(form.podTemplate) } } })
const buildJob = (form: JobFormData) => ({ apiVersion: 'batch/v1', kind: 'Job', metadata: form.metadata, spec: { completions: form.completions, parallelism: form.parallelism, backoffLimit: form.backoffLimit, activeDeadlineSeconds: form.activeDeadlineSeconds, ttlSecondsAfterFinished: form.ttlSecondsAfterFinished, template: { metadata: { labels: form.podTemplate.labels, annotations: form.podTemplate.annotations }, spec: podSpec(form.podTemplate) } } })
const buildCronJob = (form: CronJobFormData) => ({ apiVersion: 'batch/v1', kind: 'CronJob', metadata: form.metadata, spec: { schedule: form.schedule, startingDeadlineSeconds: form.startingDeadlineSeconds, concurrencyPolicy: form.concurrencyPolicy, successfulJobsHistoryLimit: form.successfulJobHistoryLimit, failedJobsHistoryLimit: form.failedJobHistoryLimit, jobTemplate: { spec: buildJob(form).spec } } })
const buildPod = (form: PodFormData) => ({ apiVersion: 'v1', kind: 'Pod', metadata: form.metadata, spec: podSpec(form.podTemplate) })
const buildService = (form: ServiceFormData) => ({ apiVersion: 'v1', kind: 'Service', metadata: form.metadata, spec: { type: form.type, selector: form.type === 'ExternalName' ? undefined : form.selector, clusterIP: form.type === 'ClusterIP' && form.clusterIP ? form.clusterIP : undefined, externalName: form.type === 'ExternalName' ? form.externalName : undefined, ...(form.type === 'ClusterIP' && form.sessionAffinity ? { sessionAffinity: form.sessionAffinity } : {}), ...(form.type === 'NodePort' && form.externalTrafficPolicy ? { externalTrafficPolicy: form.externalTrafficPolicy } : {}), ports: form.type === 'ExternalName' ? undefined : form.ports.map((port) => ({ name: port.name, port: port.port, targetPort: port.targetPort, nodePort: form.type === 'NodePort' ? port.nodePort : undefined, protocol: port.protocol })) } })
const buildIngress = (form: IngressFormData) => ({ apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', metadata: form.metadata, spec: { ingressClassName: form.ingressClassName, rules: form.rules.map((rule) => ({ host: rule.host, http: { paths: rule.paths.map((path) => ({ path: path.path, pathType: path.pathType, backend: { service: { name: path.serviceName, port: path.servicePortName ? { name: path.servicePortName } : { number: path.servicePort } } } })) } })), tls: form.tls.map((item) => ({ hosts: item.hosts, secretName: item.secretName })) } })
const buildNetworkPolicy = (form: NetworkPolicyFormData) => ({ apiVersion: 'networking.k8s.io/v1', kind: 'NetworkPolicy', metadata: form.metadata, spec: { podSelector: { matchLabels: form.podSelector }, policyTypes: form.policyTypes, ingress: form.ingress.map((rule) => ({ from: rule.peers.map((peer) => peer.peerType === 'ipBlock' ? { ipBlock: { cidr: peer.cidr, except: peer.except } } : { [peer.peerType]: { matchLabels: peer.labels } }), ports: rule.ports.map((p) => ({ port: p.port, protocol: p.protocol })) })), egress: form.egress.map((rule) => ({ to: rule.peers.map((peer) => peer.peerType === 'ipBlock' ? { ipBlock: { cidr: peer.cidr, except: peer.except } } : { [peer.peerType]: { matchLabels: peer.labels } }), ports: rule.ports.map((p) => ({ port: p.port, protocol: p.protocol })) })) } })
const buildConfigMap = (form: ConfigMapFormData) => ({ apiVersion: 'v1', kind: 'ConfigMap', metadata: form.metadata, immutable: form.immutable, data: form.data, binaryData: form.binaryData })
const buildSecret = (form: SecretFormData) => ({ apiVersion: 'v1', kind: 'Secret', metadata: form.metadata, type: form.type, immutable: form.immutable, stringData: form.stringData, data: form.data })
const buildPv = (form: PersistentVolumeFormData) => {
  const spec: any = {
    capacity: { storage: form.capacity.storage },
    accessModes: [form.accessModes],
    persistentVolumeReclaimPolicy: form.persistentVolumeReclaimPolicy
  }
  if (form.volumeMode && form.volumeMode !== 'Default') spec.volumeMode = form.volumeMode
  if (form.storageClassName) spec.storageClassName = form.storageClassName
  if (form.storageType === 'hostPath' && form.hostPath) {
    spec.hostPath = { path: form.hostPath.path, type: form.hostPath.type || undefined }
  } else if (form.storageType === 'nfs' && form.nfs) {
    spec.nfs = { server: form.nfs.server, path: form.nfs.path }
  }
  return { apiVersion: 'v1', kind: 'PersistentVolume', metadata: { name: form.metadata.name, labels: form.metadata.labels, annotations: form.metadata.annotations }, spec }
}
const buildPvc = (form: PersistentVolumeClaimFormData) => ({
  apiVersion: 'v1',
  kind: 'PersistentVolumeClaim',
  metadata: form.metadata,
  spec: {
    accessModes: [form.accessModes],
    resources: {
      requests: { storage: form.requests.storage }
    },
    storageClassName: form.storageClassName,
    ...(form.volumeMode && form.volumeMode !== 'Default' ? { volumeMode: form.volumeMode } : {}),
    selector: {
      matchLabels: form.selector.matchLabels,
      matchExpressions: form.selector.matchExpressions.map((item) => ({ key: item.key, operator: item.operator, values: item.values }))
    }
  }
})
const buildStorageClass = (form: StorageClassFormData) => ({
  apiVersion: 'storage.k8s.io/v1',
  kind: 'StorageClass',
  metadata: { name: form.metadata.name, labels: form.metadata.labels, annotations: form.metadata.annotations },
  provisioner: form.provisioner,
  ...(form.parameters && Object.keys(form.parameters).length > 0 ? { parameters: form.parameters } : {}),
  ...(form.reclaimPolicy && form.reclaimPolicy !== 'Default' ? { reclaimPolicy: form.reclaimPolicy } : {}),
  ...(form.allowVolumeExpansion ? { allowVolumeExpansion: form.allowVolumeExpansion } : {}),
  ...(form.mountOptions.filter(Boolean).length > 0 ? { mountOptions: form.mountOptions.filter(Boolean) } : {}),
  ...(form.volumeBindingMode && form.volumeBindingMode !== 'Default' ? { volumeBindingMode: form.volumeBindingMode } : {})
})
const buildSa = (form: ServiceAccountFormData) => ({ apiVersion: 'v1', kind: 'ServiceAccount', metadata: form.metadata, automountServiceAccountToken: form.automountServiceAccountToken, imagePullSecrets: form.imagePullSecrets, secrets: form.secrets })
const buildRole = (kind: 'Role'|'ClusterRole', form: RoleFormData | ClusterRoleFormData) => ({ apiVersion: 'rbac.authorization.k8s.io/v1', kind, metadata: form.metadata, rules: form.rules.map((rule) => ({ apiGroups: rule.apiGroups, resources: rule.resources, verbs: rule.verbs, resourceNames: rule.resourceNames, nonResourceURLs: kind === 'ClusterRole' ? rule.nonResourceURLs : undefined })) })
const buildBinding = (kind: 'RoleBinding'|'ClusterRoleBinding', form: RoleBindingFormData | ClusterRoleBindingFormData) => ({ apiVersion: 'rbac.authorization.k8s.io/v1', kind, metadata: form.metadata, roleRef: form.roleRef, subjects: form.subjects })
const buildHpa = (form: HorizontalPodAutoscalerFormData) => ({ apiVersion: 'autoscaling/v2', kind: 'HorizontalPodAutoscaler', metadata: form.metadata, spec: { scaleTargetRef: form.scaleTargetRef, minReplicas: form.minReplicas, maxReplicas: form.maxReplicas, metrics: form.metrics.map((metric) => metric.type === 'Resource' ? { type: 'Resource', resource: { name: metric.resourceName, target: { type: metric.targetType, averageUtilization: metric.averageUtilization, averageValue: metric.averageValue } } } : { type: metric.type, external: { metric: { name: metric.resourceName || 'custom_metric' }, target: { type: metric.targetType || 'AverageValue', averageValue: metric.averageValue || '1' } } }), behavior: { scaleDown: { selectPolicy: form.behavior.scaleDownSelectPolicy, policies: form.behavior.scaleDownPolicies } } } })
const buildNamespace = (form: NamespaceFormData) => ({ apiVersion: 'v1', kind: 'Namespace', metadata: { ...form.metadata, namespace: undefined }, spec: { finalizers: form.finalizers } })

export const useYamlGenerator = (kindRef: Ref<ResourceKind>, formRef: Ref<ResourceFormUnion>) => {
  const manifest = computed(() => {
    switch (kindRef.value) {
      case 'Deployment': return buildDeployment(formRef.value as DeploymentFormData)
      case 'StatefulSet': return buildStatefulSet(formRef.value as StatefulSetFormData)
      case 'DaemonSet': return buildDaemonSet(formRef.value as DaemonSetFormData)
      case 'Job': return buildJob(formRef.value as JobFormData)
      case 'CronJob': return buildCronJob(formRef.value as CronJobFormData)
      case 'Service': return buildService(formRef.value as ServiceFormData)
      case 'Ingress': return buildIngress(formRef.value as IngressFormData)
      case 'NetworkPolicy': return buildNetworkPolicy(formRef.value as NetworkPolicyFormData)
      case 'ConfigMap': return buildConfigMap(formRef.value as ConfigMapFormData)
      case 'Secret': return buildSecret(formRef.value as SecretFormData)
      case 'PersistentVolume': return buildPv(formRef.value as PersistentVolumeFormData)
      case 'PersistentVolumeClaim': return buildPvc(formRef.value as PersistentVolumeClaimFormData)
      case 'StorageClass': return buildStorageClass(formRef.value as StorageClassFormData)
      case 'ServiceAccount': return buildSa(formRef.value as ServiceAccountFormData)
      case 'Role': return buildRole('Role', formRef.value as RoleFormData)
      case 'ClusterRole': return buildRole('ClusterRole', formRef.value as ClusterRoleFormData)
      case 'RoleBinding': return buildBinding('RoleBinding', formRef.value as RoleBindingFormData)
      case 'ClusterRoleBinding': return buildBinding('ClusterRoleBinding', formRef.value as ClusterRoleBindingFormData)
      case 'HorizontalPodAutoscaler': return buildHpa(formRef.value as HorizontalPodAutoscalerFormData)
      case 'Namespace': return buildNamespace(formRef.value as NamespaceFormData)
      case 'Pod': return buildPod(formRef.value as PodFormData)
    }
  })

  const yamlText = computed(() => toYaml(manifest.value))
  return { manifest, yamlText }
}
