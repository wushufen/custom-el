export const symbols = {
  isProxy: Symbol('isProxy'),
  getProxy: Symbol('getProxy'),
  getProxyTarget: Symbol('getProxyTarget'),
  depsMap: Symbol('depsMap'),
}

/**
 * @param {*} target
 * @returns {boolean}
 */
export function isProxy(target) {
  return !!target[symbols.isProxy]?.()
}

/**
 * @param {*} proxy
 * @returns {*}
 */
export function toTarget(proxy) {
  return proxy?.[symbols.getProxyTarget]?.() ?? proxy
}

/**
 * @param {*} target
 */
export function toProxy(target) {
  if (!target || (typeof target !== 'object' && typeof target !== 'function'))
    return target

  let proxy = target[symbols.getProxy]?.()
  if (proxy) return proxy

  proxy = new Proxy(target, {
    get(target, key) {
      const value = target[key]

      if (key === symbols.isProxy) return value
      if (key === symbols.getProxy) return value
      if (key === symbols.getProxyTarget) return value
      if (key === symbols.depsMap) return value

      if (currentDep) {
        getDeps(target, key).add(currentDep)
      }

      return toProxy(value)
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
      // console.warn('apply', { fn, thisArg, args })
      return fn.apply(toTarget(thisArg), args)
    },
  })

  target[symbols.isProxy] = function () {
    return this === proxy
  }
  target[symbols.getProxy] = function () {
    return proxy
  }
  target[symbols.getProxyTarget] = function () {
    return target
  }

  return proxy
}

/**
 * @param {*} target
 * @param {string|symbol} key
 * @returns {Set<Function>}
 */
export function getDeps(target, key) {
  const depsMap =
    target[symbols.depsMap] || (target[symbols.depsMap] = Object.create(null))
  const deps = depsMap[key] || (depsMap[key] = new Set())
  return deps
}

/** @type {Function?} */
let currentDep = null

/**
 *
 * @param {Function} callback
 */
export function watchEffect(callback) {
  currentDep = callback
  const result = callback()
  currentDep = null

  return result
}
