# K8s YAML Generator

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)  ![Element Plus](https://img.shields.io/badge/Element%20Plus-Latest-409EFF?logo=element)  ![License](https://img.shields.io/badge/License-MIT-green)

一个基于 **Vue 3 + TypeScript + Element Plus** 构建的现代化 Kubernetes YAML 可视化生成器。旨在降低 K8s 资源清单编写门槛，通过动态表单实时生成标准 YAML，支持多种常用资源类型，并提供模板管理、导入导出等实用功能。

## ✨ 核心特性

- 🚀 **全面覆盖**：支持 Deployment, StatefulSet, Service, Ingress, ConfigMap 等 20+ 种常用 K8s 资源。
- 📝 **可视化编辑**：提供友好的动态表单，无需记忆复杂的 YAML 语法结构。
- 👁️ **实时预览**：左侧编辑，右侧实时渲染 YAML 内容，支持一键复制与下载。
- 💾 **智能缓存**：基于 Pinia + localStorage 实现表单数据自动保存，刷新不丢失（含过期策略）。
- 📦 **模板库**：内置常用配置模板，支持快速初始化表单。
- 🔄 **双向转换**：支持从现有 YAML 导入并解析为表单数据（实验性功能）。

## 📸 界面预览

![](https://gcore.jsdelivr.net/gh/liuchenyang0703/blog-images@main/images/202605081639259.png)

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **构建工具**: Vite
- **YAML 处理**: js-yaml

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 7.0.0

### 本地运行

1. 克隆项目
   ```bash
   git clone https://github.com/liuchenyang0703/k8s-yaml-generator.git
   cd k8s-yaml-generator
   ```
2. 安装依赖
   * npm
   ```bash
   npm install
   ```
   * pnpm
   ```bash
   pnpm install
   ```
3. 启动开发服务器
   * npm
   ```bash
   npm run dev
   ```
   * pnpm
   ```bash
   pnpm dev
   ```

### 构建生产版本
* npm
```
npm run build
```
* pnpm
```
pnpm build
```

## 📜 资源类型

|类别	|资源类型|
|--|--|
|工作负载	|Deployment, StatefulSet, DaemonSet, Job, CronJob, Pod|
|服务与网络	|Service, Ingress, NetworkPolicy|
|配置与存储	|ConfigMap, Secret, PersistentVolume (PV), PersistentVolumeClaim (PVC)|
|RBAC	|ServiceAccount, Role, ClusterRole, RoleBinding, ClusterRoleBinding|
|其他|	HorizontalPodAutoscaler (HPA), Namespace|


## 📁 项目目录说明

- `src/` - 源代码根目录
  - `main.ts` - 应用入口
  - `App.vue` - 主页面布局与整体逻辑
  - `env.d.ts` - TypeScript 类型扩展
  - `components/` - Vue 组件
    - `ResourceNav.vue` - 资源类型选择侧边栏
    - `YamlPreview.vue` - YAML 预览与复制下载功能
    - `common/` - 通用可复用表单组件
      - `ArrayEditor.vue` - 数组项增删改组件
      - `KeyValueEditor.vue` - 键值对编辑组件
      - `MetadataEditor.vue` - 资源元数据编辑组件（名称/命名空间/标签/注解）
      - `PodTemplateEditor.vue` - Pod 模板与容器配置（含 hostNetwork、策略、容器、探针、资源等）
      - `ResourceInput.vue` - 资源请求/限制输入组件
      - `StringListEditor.vue` - 字符串列表编辑组件
      - `NetworkRuleEditor.vue`、`PolicyRuleEditor.vue`、`ProbeEditor.vue` - 网络/策略/探针特定编辑
    - `resources/` - 各种 K8s 资源表单页
      - `DeploymentForm.vue`, `StatefulSetForm.vue`, `DaemonSetForm.vue`, `JobForm.vue`, `CronJobForm.vue`, `PodForm.vue` 等
      - `ServiceForm.vue`, `IngressForm.vue`, `NetworkPolicyForm.vue` 等网络与访问控制资源
      - `ConfigMapForm.vue`, `SecretForm.vue`, `PersistentVolumeClaimForm.vue` 等存储与配置资源
      - `ServiceAccountForm.vue`, `RoleForm.vue`, `ClusterRoleForm.vue`, `RoleBindingForm.vue`, `ClusterRoleBindingForm.vue` 等 RBAC 资源
      - `HorizontalPodAutoscalerForm.vue`, `NamespaceForm.vue`
  - `composables/` - 组合式函数钩子
    - `useK8sSchema.ts` - 资源默认模型与工厂函数（初始数据）
    - `useYamlGenerator.ts` - 表单转 YAML 的核心逻辑
  - `constants/` - 静态配置与资源列表
    - `resources.ts` - 资源类型选择项定义与说明
  - `stores/` - Pinia 状态管理
    - `resource.ts` - 当前资源类型与表单数据、localStorage 缓存（含 5 分钟过期）
  - `types/` - TypeScript 类型定义
    - `k8s.ts` - K8s 各资源表单数据结构类型
  - `utils/` - 工具函数
    - `yamlHelper.ts` - YAML 序列化/反序列化与空值清理（pruneEmpty）

- `public/` - 静态资源目录
- `Dockerfile` - 容器镜像构建脚本
- `docker-compose.yml` - 本地开发/部署 compose 配置
- `package.json`、`pnpm-lock.yaml` - 依赖与脚本
- `tsconfig*.json` - TypeScript 配置
- `vite.config.ts` - Vite 构建配置





## 🤝 贡献指南
欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/AmazingFeature)
3. 提交更改 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 **MIT** 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🙏 致谢
Vue.js
Element Plus
Kubernetes Documentation



## 📫 个人QQ邮箱（有问题请联系）

> 2162059863@qq.com



## ☕ 赞赏

如果你觉得本项目对你有所帮助，欢迎请作者喝杯热咖啡 >.<
| <img src="https://gtimg.wechatpay.cn/core/favicon.ico" /> 微信 | <img style="width: 15px" src="https://i.alipayobjects.com/common/favicon/favicon.ico" /> 支付宝 |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
| <img style="width: 160px" src="/public/images/WeChanSQ.jpg" /> | <img style="width: 160px" src="/public/images/AliPayQR.jpg" /> |


## ⭐Star History

[![Star History Chart](https://api.star-history.com/svg?repos=liuchenyang0703/k8s-yaml-generator&type=Date)](https://www.star-history.com/#liuchenyang0703/nav&Date)