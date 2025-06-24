export const symbols = {
  isProxy: Symbol('isProxy'),
  getProxy: Symbol('getProxy'),
  getProxyTarget: Symbol('getProxyTarget'),
  depsMap: Symbol('depsMap'),
}

/**
 * @param {*} target
 * @param {symbol} key
 * @param {*} value
 */
export function setSymbol(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
  })
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
      console.trace('[get]', key, value, target)

      if (Object.values(symbols).includes(key)) return value

      if (currentDep) {
        getDeps(target, key).add(currentDep)
      }

      return toProxy(value)
    },
    set(target, key, value) {
      console.trace('[set]', key, value, target)
      // @ts-ignore
      target[key] = value

      for (const dep of getDeps(target, key)) {
        dep()
      }

      return true
    },
    apply(fn, thisArg, args) {
      console.trace('[apply]', fn, args, thisArg)
      return fn.apply(toTarget(thisArg), toProxy(args))
    },
  })

  setSymbol(proxy, symbols.isProxy, function () {
    return this === proxy
  })
  setSymbol(proxy, symbols.getProxy, function () {
    return proxy
  })
  setSymbol(proxy, symbols.getProxyTarget, function () {
    return target
  })

  return proxy
}

/**
 * @param {*} target
 * @param {string|symbol} key
 * @returns {Set<Function>}
 */
export function getDeps(target, key) {
  if (!target[symbols.depsMap]) {
    setSymbol(target, symbols.depsMap, Object.create(null))
  }
  const depsMap = target[symbols.depsMap]
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
