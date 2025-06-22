export class Reactive {
  constructor(value = this) {
    return Reactive.toReactive(value)
  }
  static rawStore = new WeakMap()
  static reactiveStore = new WeakMap()
  static toRaw(value) {
    return Reactive.rawStore.get(value) ?? value
  }
  static toReactive(value) {
    if (Reactive.reactiveStore.has(value)) {
      return Reactive.reactiveStore.get(value)
    }

    if (
      !value ||
      typeof value !== 'object' ||
      typeof value === 'function' ||
      value instanceof Node
    ) {
      return value
    }

    const proxy = new Proxy(value, {
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
