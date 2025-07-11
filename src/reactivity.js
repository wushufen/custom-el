const IS_REACTIVE_KEY = Symbol('#isReactive')
const RAW_KEY = Symbol('#raw')

/**@type {WeakMap<object, InstanceType<Proxy>>} */
const objectProxies = new WeakMap()
/**@type {WeakMap<object, Record<string|symbol, Set<Function>|undefined>>} */
const objectKeyEffects = new WeakMap()
/**@type {WeakMap<Function, Map<object, Set<string|symbol>>>} */
const effectObjectKeys = new WeakMap()
/**@type {Function?=} */
let activeEffect

/**
 * @template {object} T
 * @param {T} target
 * @returns {T}
 */
function reactive(target) {
  if (!target) return target
  if (typeof target != 'object' && typeof target != 'function') return target
  if (isReactive(target)) return target
  if (objectProxies.has(target))
    return /** @type {T} */ (objectProxies.get(target))

  if (target instanceof Node) return target

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === IS_REACTIVE_KEY) return true
      if (key === RAW_KEY) return target

      const value = Reflect.get(target, key, receiver)

      // #key ignore
      if (key.toString().startsWith('#')) return value

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
      let oldLength = Reflect.get(target, 'length', receiver)
      const result = Reflect.set(target, key, raw(value), receiver)
      let length = Reflect.get(target, 'length', receiver)

      if (oldValue !== value) {
        trigger(target, key)
      }

      // a = reactive([0, 1])
      // a.push(2)
      // 相当于以下操作
      // a[2] = 2 // 此时原数组长度已经更新。所以此操作判断新旧长度触发
      // a.length = 3 // 代理数组判断已经相等，不再触发
      if (oldLength !== length) {
        trigger(target, 'length')
      }

      return result
    },
    deleteProperty(target, key) {
      console.warn('[deleteProperty]', { target, key })
      const hadKey = Reflect.has(target, key)
      const result = Reflect.deleteProperty(target, key)

      if (hadKey) {
        trigger(target, key)
      }
      return result
    },
    /**
     * @param {T&Function} fn
     */
    apply(fn, this_, args) {
      args = args.map((a) => reactive(a))

      try {
        return Reflect.apply(fn, this_, args)
      } catch (error) {
        // TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
        if (/called on incompatible/.test(String(error))) {
          DEV: if (
            ![Map, Set, WeakMap, WeakSet, Date].some((C) => this_ instanceof C)
          ) {
            console.warn(error)
          }
          return Reflect.apply(fn, raw(this_), args)
        } else {
          throw error
        }
      }
    },
  })

  objectProxies.set(target, proxy)
  setNonEnumProp(target, '#proxy', proxy)
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
 * @typedef {Promise<void>&{['#canceled']?: boolean}} CancelablePromise
 * @typedef {Function&{['#promise']?: CancelablePromise}} Effect
 * @param {Effect} effect
 */
function watchEffect(effect) {
  const PROMISE_KEY = '#promise'
  const CANCELED_KEY = '#canceled'

  if (effect[PROMISE_KEY]) {
    effect[PROMISE_KEY][CANCELED_KEY] = true
  }

  // a = reactive([0, 1])
  // a.push(2)
  // 相当于以下操作
  // a[2] = 2 // 此时原数组长度已经更新。所以此操作判断新旧长度触发
  // a.length = 3 // 代理数组判断已经相等，不再触发
  //
  // a = reactive([0, 1])
  // a.splice(0, 1)
  // 相当于以下操作，会触发多个代理操作
  // a[0] = 1 // [1, 1]
  // delete a[1] // [1, undefined] 此时触发循环会有问题
  // a.length = 1 // [1]
  //
  // 异步并取消上一个
  const promise = /**@type {CancelablePromise} */ (Promise.resolve())
  promise.then(() => {
    if (promise[CANCELED_KEY]) return console.error('effect canceled')

    let preEffect = activeEffect

    unwatch(effect)

    try {
      activeEffect = effect
      effect()
    } catch (error) {
      reportError(error)
    } finally {
      activeEffect = preEffect
    }
  })

  setNonEnumProp(effect, '#promise', promise)

  return () => unwatch(effect)
}

/**
 * @param {Function} effect
 */
function unwatch(effect) {
  const objectKeys = effectObjectKeys.get(effect)
  if (!objectKeys) return

  for (const [target, keys] of objectKeys) {
    const keyEffects = objectKeyEffects.get(target)
    if (!keyEffects) continue

    for (const key of keys) {
      const effects = keyEffects[key]
      if (!effects) continue
      console.trace('[unwatch]', { key, target, effects })

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
  console.trace('[track]', { key, target }, activeEffect)

  // object[key] => effects
  let keyEffects = objectKeyEffects.get(target)
  if (!keyEffects) {
    keyEffects = /**@type {{}}*/ (Object.create(null))
    objectKeyEffects.set(target, keyEffects)
    setNonEnumProp(target, '#keyEffects', keyEffects)
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
    setNonEnumProp(activeEffect, '#objectKeys', objectKeys)
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
    console.trace('[trigger]', { key, target }, effect)
    watchEffect(effect)
  }
}

/**
 * @param {object} target
 * @param {string|symbol} key
 * @param {unknown} value
 */
function setNonEnumProp(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
    writable: true,
    // configurable: true,
  })
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
