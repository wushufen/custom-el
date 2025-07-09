const IS_REACTIVE_KEY = Symbol()
const RAW_KEY = Symbol()

/**@type {WeakMap<object, InstanceType<Proxy>>} */
const objectProxies = new WeakMap()
/**@type {WeakMap<object, Record<string|symbol, Set<Function>|undefined>>} */
const objectKeyEffects = new WeakMap()
/**@type {WeakMap<Function, Map<object, Set<string|symbol>>>} */
const effectObjectKeys = new WeakMap()
/**@type {Function?=} */
let activeEffect

/**@type {Function[]} */
let applyStack = []
/**@type {[target:object, key:string|symbol][]} */
let applyTriggerKeys = []

/**
 * @template {object} T
 * @param {T} target
 * @returns {T}
 */
function reactive(target) {
  if (!target) return target
  if (typeof target != 'object' && typeof target != 'function') return target
  if (target instanceof Node) return target
  if (isReactive(target)) return target
  if (objectProxies.has(target))
    return /** @type {T} */ (objectProxies.get(target))

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === IS_REACTIVE_KEY) return true
      if (key === RAW_KEY) return target

      const value = Reflect.get(target, key, receiver)

      // TypeError: 'get' on proxy: property 'prototype' is a read-only and non-configurable ...
      if (value === value?.constructor?.prototype) return value

      track(target, key)
      return reactive(value)
    },
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    set(target, key, value, receiver) {
      console.warn('[set]', { target, key, value, receiver })
      const oldValue = Reflect.get(target, key, receiver)
      let oldLength
      if (key != 'length') oldLength = Reflect.get(target, 'length', receiver)

      const result = Reflect.set(target, key, raw(value), receiver)

      let length
      if (key != 'length') length = Reflect.get(target, 'length')

      if (oldValue !== value) {
        if (applyStack.length) {
          applyTriggerKeys.push([target, key])
        } else {
          trigger(target, key)
        }
      }

      // a = reactive([0, 1])
      // a.push(2)
      // 相当于以下操作
      // a[2] = 2 // 此时原数组长度已经更新。所以此操作判断新旧长度触发
      // a.length = 3 // 代理数组判断已经相等，不再触发
      if (oldLength !== length) {
        if (applyStack.length) {
          applyTriggerKeys.push([target, 'length'])
        } else {
          trigger(target, 'length')
        }
      }

      return result
    },
    deleteProperty(target, key) {
      console.warn('[deleteProperty]', { target, key })
      const exists = Reflect.has(target, key)
      const result = Reflect.deleteProperty(target, key)

      if (exists) {
        if (applyStack.length) {
          applyTriggerKeys.push([target, key])
        } else {
          trigger(target, key)
        }
      }
      return result
    },
    /**
     * @param {T&Function} fn
     */
    apply(fn, thisArg, args) {
      args = args.map((a) => reactive(a))

      // a = reactive([0, 1])
      // a.splice(0, 1)
      // 相当于以下操作，会触发多个代理操作
      // a[0] = 1 // [1, 1]
      // delete a[1] // [1, undefined] 此时触发循环会有问题
      // a.length = 1 // [1]
      // 收集在最后处理
      applyStack.push(fn)
      try {
        const result = Reflect.apply(fn, thisArg, args)

        return result
      } catch (error) {
        // TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
        if (/called on incompatible/.test(String(error))) {
          DEV: if (
            !(
              thisArg instanceof Map ||
              thisArg instanceof Set ||
              thisArg instanceof WeakMap ||
              thisArg instanceof WeakSet ||
              thisArg instanceof Date
            )
          ) {
            console.warn(error)
          }
          return Reflect.apply(fn, raw(thisArg), args)
        } else {
          throw error
        }
      } finally {
        applyStack.pop()
        if (!applyStack.length) {
          applyTriggerKeys.forEach(([target, key]) => trigger(target, key))
          applyTriggerKeys = []
        }
      }
    },
  })

  objectProxies.set(target, proxy)
  return proxy
}

/**
 * @param {*} target
 * @returns {boolean}
 */
function isReactive(target) {
  return target[IS_REACTIVE_KEY]
}

/**
 * @template {object} T
 * @param {T} target
 * @returns {T}
 */
function raw(target) {
  return /** @type {{[RAW_KEY]: T}} */ (target)?.[RAW_KEY] || target
}

/**
 * @param {*} target
 * @returns {boolean}
 */
function isRaw(target) {
  return target[RAW_KEY]
}

/**
 * @param {Function} effect
 */
function watchEffect(effect) {
  // @ts-ignore
  if (raw(effect)._promise) {
    // @ts-ignore
    raw(effect)._promise._canceled = true
  }

  const promise = Promise.resolve()
  promise.then(() => {
    // @ts-ignore
    if (promise._canceled) return

    let preEffect = activeEffect

    cleanup(effect)

    activeEffect = effect
    try {
      effect()
    } catch (error) {
      reportError(error)
    }
    activeEffect = preEffect
  })

  // @ts-ignore
  raw(effect)._promise = promise

  return () => cleanup(effect)
}

/**
 * @param {Function} effect
 */
function cleanup(effect) {
  const objectKeys = effectObjectKeys.get(effect)
  if (!objectKeys) return

  for (const [target, keys] of objectKeys) {
    const keyEffects = objectKeyEffects.get(target)
    if (!keyEffects) continue

    for (const key of keys) {
      const effects = keyEffects[key]
      if (!effects) continue
      effects.delete(effect)
    }
  }

  objectKeys.clear()
}

/**
 * @param {object} target
 * @param {string|symbol} key
 */
function track(target, key) {
  if (!activeEffect) return

  // object[key] => effects
  let keyEffects = objectKeyEffects.get(target)
  if (!keyEffects) {
    keyEffects = /**@type {{}}*/ (Object.create(null))
    objectKeyEffects.set(target, keyEffects)
  }

  let effects = keyEffects[key]
  if (!effects) {
    effects = new Set()
    keyEffects[key] = effects
  }

  effects.add(activeEffect)

  // effect => objectKeys
  let objectKeys = effectObjectKeys.get(activeEffect)
  if (!objectKeys) {
    objectKeys = new Map()
    effectObjectKeys.set(activeEffect, objectKeys)
  }

  let keys = objectKeys.get(target)
  if (!keys) {
    keys = new Set()
    objectKeys.set(target, keys)
  }

  keys.add(key)
}

/**
 * @param {object} target
 * @param {string|symbol} key
 */
function trigger(target, key) {
  const effects = objectKeyEffects.get(target)?.[key]
  if (!effects) return

  // ...: $effect() -> track -> runs.add($effect)
  for (const effect of new Set(effects)) {
    watchEffect(effect)
  }
}

class Reactive {
  constructor() {
    return reactive(this)
  }
  isRaw() {
    return isRaw(this)
  }
  isReactive() {
    return isReactive(this)
  }
  toRaw() {
    return raw(this)
  }
  toReactive() {
    return reactive(this)
  }
}

export { isRaw, isReactive, raw, Reactive, reactive, watchEffect }
