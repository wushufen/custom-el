/** object => proxy */
export const objectProxyMap = new WeakMap()
/** proxy => object */
export const proxyObjectMap = new WeakMap()
/** object[depsMapKey] => deps */
export const depsMapKey = Symbol('depsMap')

/**
 * @param {object} target
 */
export function getDepsMap(target) {
  target = toRaw(target)

  // @ts-ignore
  const depsMap = target[depsMapKey]
  if (!depsMap) {
    Object.defineProperty(target, depsMapKey, {
      value: Object.create(null),
      configurable: true,
    })
    // @ts-ignore
    return target[depsMapKey]
  }
  return depsMap
}

/**
 * @param {object} target
 * @param {string|number|symbol} key
 * @returns {Set<Function>}
 */
export function getDeps(target, key) {
  target = toRaw(target)
  const depsMap = getDepsMap(target)
  const deps = depsMap[key] || (depsMap[key] = new Set())
  return deps
}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function toReactive(value) {
  if (isReactive(value)) return value
  if (objectProxyMap.has(value)) return objectProxyMap.get(value)
  if (!value || typeof value !== 'object') return value

  const proxy = new Proxy(value, {
    get(target, key) {
      // @ts-ignore
      const value = target[key]

      if (currentDep) {
        getDeps(target, key).add(currentDep)
      }

      return toReactive(value)
    },
    set(target, key, value) {
      // @ts-ignore
      target[key] = value

      for (const dep of getDeps(target, key)) {
        dep()
      }

      return true
    },
    apply(fn, thisArg, args) {
      return fn.apply(toRaw(thisArg), args)
    },
  })

  objectProxyMap.set(value, proxy)
  proxyObjectMap.set(proxy, value)

  return proxy
}

/**
 * @param {*} value
 */
export function isReactive(value) {
  return proxyObjectMap.has(value)
}

/**
 * @param {*} value
 */
export function isRaw(value) {
  return !isReactive(value)
}

/**
 * @param {*} value
 */
export function toRaw(value) {
  if (isReactive(value)) return proxyObjectMap.get(value)
  return value
}

/** @type {Function?} */
let currentDep = null

/**
 *
 * @param {Function} callback
 */
export function watchEffect(callback) {
  currentDep = callback
  callback()
  currentDep = null
}
