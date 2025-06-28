import { Reactive } from './Reactive.js'

/**
 * @example
 * Extra.get(target, key)
 * Extra.set(target, key, value)
 *
 * Extra.get(target).key
 * Extra.get(target).key = value
 */
export class Extra {
  static extraMap = new WeakMap()
  static extraKey = Symbol('extra')
  /**
   * @param {object} target
   * @param {string|symbol} key
   * @param {unknown} value
   */
  static set(target, key, value) {
    this.get(target)[key] = value

    return value
  }
  /**
   * @param {object} target
   * @param {string|symbol} [key]
   */
  static get(target, key) {
    target = Reactive.toRaw(target)
    let extra = this.extraMap.get(target)

    if (!extra) {
      extra = Object.create(null)
      this.extraMap.set(target, extra)

      // debug symbol
      Object.defineProperty(target, this.extraKey, {
        value: extra,
        enumerable: false,
      })
    }

    if (key) {
      return extra?.[key]
    } else {
      return extra
    }
  }
}
