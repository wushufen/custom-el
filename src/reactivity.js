import {
  apply,
  defineProperty,
  deleteProperty,
  get,
  has,
  instanceOf,
  set,
} from './globals.js'

const IS_REACTIVE_KEY = Symbol(/*'#isReactive'*/)
const RAW_KEY = Symbol(/*'#raw'*/)

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
  if (!instanceOf(target, Object)) return target
  if (isReactive(target)) return target
  if (objectProxies.has(target))
    return /** @type {T} */ (objectProxies.get(target))

  if (instanceOf(target, Node)) return target

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === IS_REACTIVE_KEY) return true
      if (key === RAW_KEY) return target

      let value
      // Uncaught TypeError: Method get Set.prototype.size called on incompatible receiver #<Set>
      try {
        value = get(target, key, receiver)
      } catch (error) {
        value = get(target, key)
      }

      // #key ignore
      if (key.toString().startsWith('#')) return value

      // TypeError: 'get' on proxy: property 'prototype' is a read-only and non-configurable ...
      if (value === value?.constructor?.prototype) return value

      track(target, key)
      return reactive(value)
    },
    has(target, key) {
      track(target, key)
      return has(target, key)
    },
    set(target, key, value, receiver) {
      const oldValue = get(target, key, receiver)
      const result = set(target, key, raw(value), receiver)

      if (oldValue !== value) {
        trigger(target, key)
      }

      return result
    },
    deleteProperty(target, key) {
      const hadKey = has(target, key)
      const result = deleteProperty(target, key)

      if (hadKey) {
        trigger(target, key)
      }
      return result
    },
    /**
     * @param {T&Function} fn
     * @param {{length?:*,size?:*}?} this_
     */
    apply(fn, this_, args) {
      const _this = raw(this_)
      args = args.map((a) => reactive(a))

      const oldLength = _this?.length
      const oldSize = _this?.size
      try {
        return apply(fn, this_, args)
      } catch (error) {
        // TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
        if (/called on incompatible/.test(String(error))) {
          return apply(fn, _this, args)
        } else {
          throw error
        }
      } finally {
        // a = reactive([0, 1])
        // a.push(2)
        // 相当于以下操作
        // a[2] = 2 // 此时原数组长度已经更新。所以此操作判断新旧长度触发
        // a.length = 3 // 代理数组判断已经相等，不再触发
        if (_this && _this.length !== oldLength) {
          trigger(_this, 'length')
          // [...a] // 也触发 get length
          // trigger(_this, Symbol.iterator)
        }

        // s = reactive(new Set)
        // s.add(0) // 不会触发 set size
        // [...s.keys()] //
        // [...s.values()] //
        // [...s] // get Symbol.iterator
        if (_this && _this.size !== oldSize) {
          trigger(_this, 'size')
          trigger(_this, 'keys')
          trigger(_this, 'values')
          trigger(_this, Symbol.iterator)
        }
      }
    },
  })

  objectProxies.set(target, proxy)
  DEV: setNonEnumProp(target, Symbol('#proxy'), proxy)
  return proxy
}

/**
 * @param {*} target
 * @returns {boolean}
 */
function isReactive(target) {
  return target?.[IS_REACTIVE_KEY]
}

/**
 * @template {*} T
 * @param {T} target
 * @returns {T}
 */
function raw(target) {
  return /** @type {{[RAW_KEY]?: T}} */ (target)?.[RAW_KEY] || target
}

/**
 * @param {*} target
 * @returns {boolean}
 */
function isRaw(target) {
  return target[RAW_KEY]
}

/**
 * @typedef {Promise<void>&{['#aborted']?: boolean}} CancelablePromise
 * @typedef {Function&{['#promise']?: CancelablePromise}} Effect
 * @param {Effect} effect
 */
function watchEffect(effect) {
  const PROMISE_KEY = '#promise'
  const ABORTED_KEY = '#aborted'

  if (effect[PROMISE_KEY]) {
    effect[PROMISE_KEY][ABORTED_KEY] = true
  }

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
    if (promise[ABORTED_KEY]) return console.error('effect aborted')

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

  setNonEnumProp(effect, PROMISE_KEY, promise)

  return () => unwatch(effect)
}

/**
 * @param {Function} effect
 */
function unwatch(effect) {
  const objectKeys = effectObjectKeys.get(effect)
  if (!objectKeys) return

  for (const [object, keys] of objectKeys) {
    const keyEffects = objectKeyEffects.get(object)
    if (!keyEffects) continue

    for (const key of keys) {
      const effects = keyEffects[key]
      if (!effects) continue
      effects.delete(effect)

      if (!effects.size) {
        delete keyEffects[key]
      }
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
    DEV: setNonEnumProp(target, Symbol('#keyEffects'), keyEffects)
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
    DEV: setNonEnumProp(activeEffect, Symbol('#objectKeys'), objectKeys)
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

/**
 * @param {object} target
 * @param {string|symbol} key
 * @param {unknown} value
 */
function setNonEnumProp(target, key, value) {
  defineProperty(target, key, {
    value,
    enumerable: false,
    writable: true,
    // configurable: true,
  })
}

export { isRaw, isReactive, raw, reactive, watchEffect }
