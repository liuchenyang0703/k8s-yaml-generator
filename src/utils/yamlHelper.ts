import yaml from 'js-yaml'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]'

export const pruneEmpty = <T>(input: T): T => {
  if (Array.isArray(input)) {
    return input
      .map((item) => pruneEmpty(item))
      .filter((item) => item !== undefined && item !== null && item !== '' && !(Array.isArray(item) && item.length === 0)) as T
  }

  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {}
    Object.entries(input).forEach(([key, value]) => {
      if (key.startsWith('__')) return
      const cleaned = pruneEmpty(value)
      const shouldKeep = !(
        cleaned === undefined ||
        cleaned === null ||
        cleaned === '' ||
        cleaned === false ||
        (Array.isArray(cleaned) && cleaned.length === 0) ||
        (isPlainObject(cleaned) && Object.keys(cleaned).length === 0)
      )
      // emptyDir is intentionally represented by an empty object in Kubernetes YAML.
      if (shouldKeep || key === 'emptyDir') result[key] = cleaned
    })
    return result as T
  }

  return input
}

export const toYaml = (value: unknown): string =>
  yaml.dump(pruneEmpty(value), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    quotingType: '"'
  })
export const fromYaml = <T = unknown>(value: string): T => yaml.load(value) as T
