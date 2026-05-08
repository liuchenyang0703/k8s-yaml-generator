import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ResourceFormUnion, ResourceKind } from '@/types/k8s'
import { RESOURCE_KIND_OPTIONS } from '@/constants/resources'
import { createDefaultResourceByKind } from '@/composables/useK8sSchema'

type FormsMap = Record<ResourceKind, ResourceFormUnion>

const createAllForms = (): FormsMap => RESOURCE_KIND_OPTIONS.reduce((acc, kind) => {
  acc[kind] = createDefaultResourceByKind(kind)
  return acc
}, {} as FormsMap)

export const useResourceStore = defineStore('resource', () => {
  const currentKind = ref<ResourceKind>('Deployment')
  const forms = ref<FormsMap>(createAllForms())

  const restore = () => {
    currentKind.value = 'Deployment'
    forms.value = createAllForms()
  }

  const persist = () => {
    // 取消本地缓存，空实现
  }

  const currentForm = computed<ResourceFormUnion>({
    get: () => forms.value[currentKind.value],
    set: (value) => { forms.value[currentKind.value] = value }
  })

  const setKind = (kind: ResourceKind) => {
    currentKind.value = kind
    if (!forms.value[kind]) forms.value[kind] = createDefaultResourceByKind(kind)
  }

  const resetCurrentForm = () => { forms.value[currentKind.value] = createDefaultResourceByKind(currentKind.value) }
  const replaceCurrentForm = (value: ResourceFormUnion) => { forms.value[currentKind.value] = value }

  watch([currentKind, forms], persist, { deep: true })

  return { currentKind, forms, currentForm, restore, setKind, resetCurrentForm, replaceCurrentForm }
})
