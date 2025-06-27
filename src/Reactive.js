import { Extra } from './Extra.js'

export class Reactive {
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
    return !!target[Reactive.IS_REACTIVE_KEY]
  }
  /**
   * @template T
   * @param {T} target
   * @returns {T}
   */
  static toReactive(target) {
    if (Reactive.isReactive(target)) return target
    if (!target || (typeof target != 'object' && typeof target != 'function'))
      return target
    let proxy = Extra.get(target).proxy
    if (proxy) return proxy

    proxy = new Proxy(target, {
      get: (target, key, receiver) => {
        console.trace('[get]', { key, target })
        if (key == Reactive.IS_REACTIVE_KEY) return true
        if (key == Reactive.RAW_KEY) return target

        const value = Reflect.get(target, key, receiver)

        // TypeError: 'get' on proxy: property 'prototype' is a read-only and non-configurable ...
        if (value == value?.constructor?.prototype) return value

        return Reactive.toReactive(value)
      },
      set: (target, key, value, receiver) => {
        console.trace('[set]', { key, value, target })
        Reflect.set(target, key, value, receiver)

        return true
      },
      apply(fn, thisArg, args) {
        console.trace('[apply]', { fn, args, thisArg })

        // TypeError: Method Map.prototype.set called on incompatible receiver #<Map>
        if (thisArg instanceof Map || thisArg instanceof Set) {
          return Reflect.apply(fn, Reactive.toRaw(thisArg), args)
        }

        return Reflect.apply(
          fn,
          // Reactive.toRaw(thisArg),
          thisArg,
          Reactive.toReactive(args)
        )
      },
    })

    Extra.get(target).proxy = proxy
    return proxy
  }
}
