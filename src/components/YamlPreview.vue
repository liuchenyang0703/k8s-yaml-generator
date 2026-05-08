<template>
  <div class="preview-panel" ref="previewRef">
    <div class="toolbar">
      <span>YAML 预览</span>
      <div class="actions">
        <el-button size="small" @click="copyYaml">复制</el-button>
        <el-button size="small" type="primary" @click="downloadYaml">下载</el-button>
        <el-button size="small" type="warning" @click="toggleFullscreen">{{ isFullscreen ? '退出全屏' : '全屏' }}</el-button>
      </div>
    </div>
    <pre class="code-block"><code v-html="highlightedYaml"></code></pre>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import { ElMessage } from 'element-plus'
hljs.registerLanguage('yaml', yaml)

const props = defineProps<{ yamlText: string; filename: string }>()
const previewRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const highlightedYaml = computed(() => hljs.highlight(props.yamlText, { language: 'yaml' }).value)

const copyYaml = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.yamlText)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = props.yamlText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!successful) throw new Error('execCommand copy failed')
    }
    ElMessage.success('YAML 已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动选择并复制')
  }
}

const downloadYaml = () => {
  const blob = new Blob([props.yamlText], { type: 'application/x-yaml;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${props.filename}.yaml`
  link.click()
  URL.revokeObjectURL(link.href)
}

const toggledFullscreen = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const toggleFullscreen = async () => {
  if (!previewRef.value) return
  if (!document.fullscreenElement) {
    await previewRef.value.requestFullscreen().catch(() => {})
  } else {
    await document.exitFullscreen().catch(() => {})
  }
}

window.addEventListener('fullscreenchange', toggledFullscreen)
window.addEventListener('webkitfullscreenchange', toggledFullscreen)
window.addEventListener('mozfullscreenchange', toggledFullscreen)
window.addEventListener('MSFullscreenChange', toggledFullscreen)
</script>
<style scoped>
.preview-panel{min-height:520px;display:flex;flex-direction:column;background:#0f172a;color:#e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,.18)}
.preview-panel:fullscreen{position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;border-radius:0}
.toolbar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#111827;border-bottom:1px solid rgba(255,255,255,.08);gap:12px}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.code-block{margin:0;padding:16px;overflow:auto;overflow-y:auto;flex:1;font-size:13px;line-height:1.6;max-height:calc(100vh - 100px)}
@media (max-width: 640px){.toolbar{flex-direction:column;align-items:flex-start}.preview-panel{min-height:420px}}
</style>
