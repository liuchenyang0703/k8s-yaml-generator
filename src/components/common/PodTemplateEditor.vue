<template>
  <el-card shadow="never">
    <template #header>{{ title }}</template>
    <div class="grid-two">
      <el-form-item label="重启策略">
        <el-select v-model="model.restartPolicy" placeholder="可不选" clearable>
          <el-option label="不指定" value="" />
          <el-option label="总是重启" value="Always" />
          <el-option label="失败时重启" value="OnFailure" />
          <el-option label="从不重启" value="Never" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务账号">
        <el-input v-model="model.serviceAccountName" />
      </el-form-item>
      <el-form-item label="优雅终止秒数">
        <el-input-number v-model="model.terminationGracePeriodSeconds" :min="0" />
      </el-form-item>
      <el-form-item label="使用主机网络">
        <el-switch v-model="model.hostNetwork" />
      </el-form-item>
      <el-form-item label="指定部署节点">
        <el-input v-model="model.nodeName" placeholder="输入节点名称" />
      </el-form-item>
    </div>
    <el-form-item label="Pod 标签">
      <KeyValueEditor v-model="model.labels" key-placeholder="标签键" value-placeholder="标签值" />
    </el-form-item>
    <el-form-item label="Pod 注解">
      <KeyValueEditor v-model="model.annotations" key-placeholder="注解键" value-placeholder="注解值" />
    </el-form-item>

    <ArrayEditor v-model="model.tolerations" title="容忍" label-key="key" :create-item="createToleration">
      <template #default="{ item }">
        <div class="grid-five">
          <el-form-item label="键"><el-input v-model="item.key" /></el-form-item>
          <el-form-item label="操作符">
            <el-select v-model="item.operator">
              <el-option label="存在" value="Exists" />
              <el-option label="等于" value="Equal" />
            </el-select>
          </el-form-item>
          <el-form-item label="值"><el-input v-model="item.value" :disabled="item.operator === 'Exists'" /></el-form-item>
          <el-form-item label="影响">
            <el-select v-model="item.effect">
              <el-option label="NoSchedule" value="NoSchedule" />
              <el-option label="PreferNoSchedule" value="PreferNoSchedule" />
              <el-option label="NoExecute" value="NoExecute" />
            </el-select>
          </el-form-item>
          <el-form-item label="容忍秒数"><el-input-number v-model="item.tolerationSeconds" :min="0" /></el-form-item>
        </div>
      </template>
    </ArrayEditor>

    <ArrayEditor v-model="model.containers" title="容器" label-key="name" :create-item="createContainer">
      <template #default="{ item }">
        <div class="grid-three">
          <el-form-item label="容器名"><el-input v-model="item.name" /></el-form-item>
          <el-form-item label="镜像">
            <el-autocomplete v-model="item.image" :fetch-suggestions="queryImages" clearable />
          </el-form-item>
          <el-form-item label="镜像拉取策略">
            <el-select v-model="item.imagePullPolicy">
              <el-option label="Always" value="Always" />
              <el-option label="Never" value="Never" />
              <el-option label="IfNotPresent" value="IfNotPresent" />
            </el-select>
          </el-form-item>
        </div>

        <ArrayEditor v-model="item.ports" title="端口" label-key="name" :create-item="createPort">
          <template #default="{ item: port }">
            <div class="grid-three">
              <el-form-item label="名称"><el-input v-model="port.name" /></el-form-item>
              <el-form-item label="容器端口"><el-input-number v-model="port.containerPort" :min="1" :max="65535" /></el-form-item>
              <el-form-item label="协议">
                <el-select v-model="port.protocol"><el-option label="TCP" value="TCP" /><el-option label="UDP" value="UDP" /><el-option label="SCTP" value="SCTP" /></el-select>
              </el-form-item>
            </div>
          </template>
        </ArrayEditor>

        <ArrayEditor v-model="item.env" title="环境变量" label-key="name" :create-item="createEnv">
          <template #default="{ item: env }">
            <div class="grid-four">
              <el-form-item label="变量名"><el-autocomplete v-model="env.name" :fetch-suggestions="queryEnvNames" /></el-form-item>
              <el-form-item label="来源类型">
                <el-select v-model="env.valueFrom.type">
                  <el-option label="直接值" value="value" />
                  <el-option label="ConfigMapKeyRef" value="configMapKeyRef" />
                  <el-option label="SecretKeyRef" value="secretKeyRef" />
                  <el-option label="FieldRef" value="fieldRef" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="env.valueFrom.type === 'value'" label="值"><el-input v-model="env.valueFrom.value" /></el-form-item>
              <template v-else-if="env.valueFrom.type === 'fieldRef'">
                <el-form-item label="字段路径"><el-input v-model="env.valueFrom.fieldPath" placeholder="metadata.name" /></el-form-item>
              </template>
              <template v-else>
                <el-form-item label="资源名"><el-input v-model="env.valueFrom.name" /></el-form-item>
                <el-form-item label="键"><el-input v-model="env.valueFrom.key" /></el-form-item>
              </template>
            </div>
          </template>
        </ArrayEditor>

    <ArrayEditor v-model="model.volumes" title="卷挂载" label-key="name" :create-item="createVolume">
      <template #default="{ item }">
        <div class="grid-four">
          <el-form-item label="名称"><el-input v-model="item.name" /></el-form-item>
          <el-form-item label="类型">
            <el-select v-model="item.type">
              <el-option label="emptyDir" value="emptyDir" />
              <el-option label="ConfigMap" value="configMap" />
              <el-option label="Secret" value="secret" />
              <el-option label="PVC" value="persistentVolumeClaim" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="item.type !== 'emptyDir'" label="引用名称"><el-input v-model="item.sourceName" /></el-form-item>
          <el-form-item v-if="item.type === 'persistentVolumeClaim'" label="PVC 名称"><el-input v-model="item.claimName" /></el-form-item>
        </div>
      </template>
    </ArrayEditor>

        <ArrayEditor v-model="item.volumeMounts" title="卷挂载路径" label-key="name" :create-item="createVolumeMount">
          <template #default="{ item: mount }">
            <div class="grid-three">
              <el-form-item label="卷名称">
                <el-select v-model="mount.name" placeholder="请选择卷名称">
                  <el-option v-for="vol in model.volumes" :key="vol.name" :label="vol.name" :value="vol.name" />
                </el-select>
              </el-form-item>
              <el-form-item label="挂载路径"><el-input v-model="mount.mountPath" /></el-form-item>
              <el-form-item label="子路径 subPath"><el-input v-model="mount.subPath" placeholder="可选" /></el-form-item>
              <el-form-item label="只读"><el-switch v-model="mount.readOnly" /></el-form-item>
            </div>
          </template>
        </ArrayEditor>

        <div class="grid-four">
          <el-form-item label="启用资源配置"><el-switch v-model="item.resourcesEnabled" /></el-form-item>
          <el-form-item label="特权模式"><el-switch v-model="item.securityContext.privileged" /></el-form-item>
          <el-form-item label="启用健康检查"><el-switch v-model="item.probeEnabled" /></el-form-item>
        </div>

        <div v-if="item.probeEnabled" class="grid-three" style="margin-bottom:20px;">
          <div>
            <h4 style="margin: 0 0 8px; font-weight: 600">Liveness 探针</h4>
            <el-form-item label="类型">
              <el-select v-model="item.livenessProbe.type">
                <el-option label="HTTP GET" value="httpGet" />
                <el-option label="TCP Socket" value="tcpSocket" />
                <el-option label="Exec" value="exec" />
              </el-select>
            </el-form-item>
            <el-form-item label="初始延迟秒数"><el-input-number v-model="item.livenessProbe.initialDelaySeconds" :min="0" /></el-form-item>
            <el-form-item label="间隔秒数"><el-input-number v-model="item.livenessProbe.periodSeconds" :min="1" /></el-form-item>
            <template v-if="item.livenessProbe.type === 'httpGet'">
              <el-form-item label="路径"><el-input v-model="item.livenessProbe.httpGet.path" /></el-form-item>
              <el-form-item label="端口"><el-input-number v-model="item.livenessProbe.httpGet.port" :min="1" :max="65535" /></el-form-item>
            </template>
            <template v-else-if="item.livenessProbe.type === 'tcpSocket'">
              <el-form-item label="端口"><el-input-number v-model="item.livenessProbe.tcpSocketPort" :min="1" :max="65535" /></el-form-item>
            </template>
            <template v-else>
              <el-form-item label="命令"><el-input v-model="item.livenessProbe.execCommand" placeholder="ls -la" /></el-form-item>
            </template>
          </div>

          <div>
            <h4 style="margin: 0 0 8px; font-weight: 600">Readiness 探针</h4>
            <el-form-item label="类型">
              <el-select v-model="item.readinessProbe.type">
                <el-option label="HTTP GET" value="httpGet" />
                <el-option label="TCP Socket" value="tcpSocket" />
                <el-option label="Exec" value="exec" />
              </el-select>
            </el-form-item>
            <el-form-item label="初始延迟秒数"><el-input-number v-model="item.readinessProbe.initialDelaySeconds" :min="0" /></el-form-item>
            <el-form-item label="间隔秒数"><el-input-number v-model="item.readinessProbe.periodSeconds" :min="1" /></el-form-item>
            <template v-if="item.readinessProbe.type === 'httpGet'">
              <el-form-item label="路径"><el-input v-model="item.readinessProbe.httpGet.path" /></el-form-item>
              <el-form-item label="端口"><el-input-number v-model="item.readinessProbe.httpGet.port" :min="1" :max="65535" /></el-form-item>
            </template>
            <template v-else-if="item.readinessProbe.type === 'tcpSocket'">
              <el-form-item label="端口"><el-input-number v-model="item.readinessProbe.tcpSocketPort" :min="1" :max="65535" /></el-form-item>
            </template>
            <template v-else>
              <el-form-item label="命令"><el-input v-model="item.readinessProbe.execCommand" placeholder="ls -la" /></el-form-item>
            </template>
          </div>
        </div>

        <div v-if="item.resourcesEnabled" class="grid-two">
          <el-form-item label="CPU 请求"><ResourceInput v-model="item.resources.requests.cpu" tip="m" /></el-form-item>
          <el-form-item label="内存请求"><ResourceInput v-model="item.resources.requests.memory" tip="Mi/Gi" /></el-form-item>
          <el-form-item label="CPU 限制"><ResourceInput v-model="item.resources.limits.cpu" tip="m" /></el-form-item>
          <el-form-item label="内存限制"><ResourceInput v-model="item.resources.limits.memory" tip="Mi/Gi" /></el-form-item>
        </div>
      </template>
    </ArrayEditor>
  </el-card>
</template>

<script setup lang="ts">
import ArrayEditor from './ArrayEditor.vue'
import KeyValueEditor from './KeyValueEditor.vue'
import ResourceInput from './ResourceInput.vue'
import { COMMON_ENV_SUGGESTIONS, COMMON_IMAGE_SUGGESTIONS } from '@/constants/resources'
import { createContainer, createEnv, createPort, createToleration, createVolume, createVolumeMount } from '@/composables/useK8sSchema'

defineProps<{ model: any; title?: string }>()

const queryImages = (queryString: string, cb: (data: Array<{ value: string }>) => void) => {
  cb(COMMON_IMAGE_SUGGESTIONS.filter((item) => item.includes(queryString)).map((item) => ({ value: item })))
}
const queryEnvNames = (queryString: string, cb: (data: Array<{ value: string }>) => void) => {
  cb(COMMON_ENV_SUGGESTIONS.filter((item) => item.includes(queryString.toUpperCase())).map((item) => ({ value: item })))
}
</script>

<style scoped>
.grid-two,.grid-three,.grid-four,.grid-five { display:grid; gap:16px; }
.grid-two { grid-template-columns: repeat(2, minmax(0,1fr)); }
.grid-three { grid-template-columns: repeat(3, minmax(0,1fr)); }
.grid-four { grid-template-columns: repeat(4, minmax(0,1fr)); }
.grid-five { grid-template-columns: repeat(5, minmax(0,1fr)); }
.el-form-item { margin-bottom: 18px; }
</style>
