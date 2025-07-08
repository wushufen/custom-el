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
      const result = Reflect.set(target, key, raw(value), receiver)

      trigger(target, key)
      return result
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)

      trigger(target, key)
      return result
    },
    /**
     * @param {T&Function} fn
     */
    apply(fn, thisArg, args) {
      args = args.map((a) => reactive(a))

      try {
        return Reflect.apply(fn, thisArg, args)
      } catch (error) {
        // TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
        if (/called on incompatible/.test(String(error))) {
          console.warn(error)
          return Reflect.apply(fn, raw(thisArg), args)
        } else {
          throw error
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
  let preEffect = activeEffect

  function $effect() {
    cleanup($effect)

    activeEffect = $effect
    try {
      effect()
    } catch (error) {
      reportError(error)
    }
    activeEffect = preEffect
  }
  $effect()

  return () => cleanup($effect)
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
  for (const effect of [...effects]) {
    effect()
  }
}

export { isRaw, isReactive, raw, reactive, watchEffect }
