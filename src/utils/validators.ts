const DNS_SUBDOMAIN_REGEX = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const LABEL_KEY_REGEX = /^(?:[a-z0-9]([-a-z0-9_.]*[a-z0-9])?\/)?[A-Za-z0-9]([-.A-Za-z0-9_]*[A-Za-z0-9])?$/
const RESOURCE_CPU_REGEX = /^(\d+m|\d+(\.\d+)?)$/
const RESOURCE_MEMORY_REGEX = /^\d+(Ki|Mi|Gi|Ti|Pi|Ei)$/

export const isValidDnsName = (value: string): boolean => DNS_SUBDOMAIN_REGEX.test(value)
export const isValidLabelKey = (value: string): boolean => LABEL_KEY_REGEX.test(value)
export const isValidCpu = (value: string): boolean => RESOURCE_CPU_REGEX.test(value)
export const isValidMemory = (value: string): boolean => RESOURCE_MEMORY_REGEX.test(value)
export const isValidPort = (value: number): boolean => value >= 1 && value <= 65535
export const requiredRule = (message: string) => ({ required: true, message, trigger: 'blur' })
