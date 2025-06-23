export class Reactive {
  constructor(value = this) {
    return Reactive.toReactive(value)
  }
  /** reactive => raw
   * @type {WeakMap<object, object>}
   */
  static rawStore = new WeakMap()
  /** raw => reactive
   * @type {WeakMap<object, object>}
   */
  static reactiveStore = new WeakMap()
  /**
   * @param {object} value
   */
  static toRaw(value) {
    return Reactive.rawStore.get(value) ?? value
  }
  /**
   * @param {object} value
   */
  static toReactive(value) {
    let proxy = this.reactiveStore.get(value)
    if (proxy) return proxy

    proxy = new Proxy(value, {
      get: (target, key) => {
        const value = target[key]

        return Reactive.toReactive(value)
      },
      set: (target, key, value) => {
        target[key] = value

        return true
      },
    })

    Reactive.reactiveStore.set(value, proxy)
    Reactive.rawStore.set(proxy, value)

    return proxy
  }
}
