import { isRaw, isReactive, raw, reactive } from './reactivity.js'

export class Reactive {
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
