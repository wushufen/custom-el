import { Extra } from './Extra.js'

export class Reactive {
  /**
   * @template T
   * @param {T} target
   * @returns {T}
   */
  constructor(target = this) {
    return Reactive.toReactive(target)
  }
  static IS_REACTIVE_KEY = Symbol('isReactive')
  static RAW_KEY = Symbol('raw')
  /**
   * @param {*} target
   */
  static isRaw(target) {
    return !Reactive.isReactive(target)
  }
  /**
   * @template T
   * @param {T} target
   * @returns {T}
   */
  static toRaw(target) {
    return target?.[Reactive.RAW_KEY] ?? target
  }
  /**
   * @param {*} target
   */
  static isReactive(target) {
    return !!target?.[Reactive.IS_REACTIVE_KEY]
  }
  /**
   * @template T
   * @param {T} target
   * @returns {T}
   */
  static toReactive(target) {
    if (!target) return target
    if (typeof target != 'object' && typeof target != 'function') return target
    if (target instanceof Node) return target

    if (Reactive.isReactive(target)) return target
    let proxy = Extra.get(target).proxy
    if (proxy) return proxy

    proxy = new Proxy(target, {
      get(target, key, receiver) {
        if (key == Reactive.IS_REACTIVE_KEY) return true
        if (key == Reactive.RAW_KEY) return target

        let value
        try {
          value = Reflect.get(target, key, receiver)
        } catch (error) {
          console.warn(error)
          value = Reflect.get(target, key)
        }

        // TypeError: 'get' on proxy: property 'prototype' is a read-only and non-configurable ...
        // if (value == value?.constructor) return value
        // if (value == value?.constructor?.prototype) return value
        // if (key == 'constructor') return value
        if (value && value === value.constructor?.prototype) {
          return value
        } else if (key == 'prototype') {
          debugger
        }

        console.trace('[get]', { key, target })
        Reactive.track(target, key)

        return Reactive.toReactive(value)
      },
      set(target, key, value, receiver) {
        console.trace('[set]', { key, value, target })
        Reflect.set(target, key, Reactive.toRaw(value), receiver)

        Reactive.trigger(target, key)

        return true
      },
      deleteProperty(target, key) {
        console.trace('[deleteProperty]', { key, target })
        const result = Reflect.deleteProperty(target, key)

        Reactive.trigger(target, key)

        return result
      },
      apply(fn, thisArg, args) {
        console.trace('[apply]', { fn, args, thisArg })

        // TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
        if (
          thisArg instanceof Map ||
          thisArg instanceof Set ||
          thisArg instanceof WeakMap ||
          thisArg instanceof WeakSet
        ) {
          return Reflect.apply(
            fn,
            Reactive.toRaw(thisArg),
            Reactive.toReactive(args)
          )
        }

        try {
          return Reflect.apply(fn, thisArg, Reactive.toReactive(args))
        } catch (error) {
          console.warn(error)
          try {
            return Reflect.apply(
              fn,
              Reactive.toRaw(thisArg),
              Reactive.toReactive(args)
            )
          } catch (error) {
            console.warn(error)
            return Reflect.apply(fn, Reactive.toRaw(thisArg), args)
          }
        }
      },
    })

    Extra.get(target).proxy = proxy
    return proxy
  }
  /**
   * @param {object} target
   * @param {string|symbol} key
   */
  static track(target, key) {
    const effect = Reactive.currentEffect
    if (!effect) return
    console.trace('[track]', { key, target }, effect)

    let depsMap = Extra.get(target, 'depsMap')
    if (!depsMap) depsMap = Extra.set(target, 'depsMap', Object.create(null))
    if (!depsMap[key]) depsMap[key] = new Set()
    depsMap[key].add(effect)

    let objects = Extra.get(effect, 'objects')
    if (!objects) objects = Extra.set(effect, 'objects', new Set())
    objects.add(target)
  }
  /**
   * @param {object} target
   * @param {string|symbol} key
   */
  static trigger(target, key) {
    const deps = Extra.get(target, 'depsMap')?.[key]
    if (!deps) return

    for (const effect of deps) {
      console.trace('[trigger]', { key, target }, effect)
      Reactive.watchEffect(effect)
    }
  }
  /**
   * @type {Function?}
   */
  static currentEffect = null
  /**
   * @param {Function} effect
   */
  static watchEffect(effect) {
    Reactive.currentEffect = effect
    effect()
    Reactive.currentEffect = null

    return function stop() {
      const objects = Extra.get(effect, 'objects')
      if (!objects) return

      for (const object of objects) {
        const depsMap = Extra.get(object, 'depsMap')
        for (const key in depsMap) {
          depsMap[key].delete(effect)
        }
      }
      Extra.set(effect, 'objects', null)
    }
  }
}

export const reactive = Reactive.toReactive
