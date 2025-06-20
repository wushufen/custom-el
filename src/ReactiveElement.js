export class ReactiveElement extends HTMLElement {
  constructor() {
    super()

    // https://github.com/WICG/webcomponents/issues/857#issuecomment-560012716
    // Object.setPrototypeOf(
    //   this,
    //   new Proxy(Object.create(HTMLElement.prototype), {
    //     get(_target, key) {
    //       let value
    //       try {
    //         value = _target[key]
    //         console.log('get', key, value)

    //         if (typeof value == 'function') {
    //           return value.bind(self)
    //         }
    //       } catch (error) {}

    //       value = self[key]

    //       return value
    //     },
    //     set(_target, key, value) {
    //       console.log('set', key, value)
    //       self[key] = value
    //       return true
    //     },
    //   })
    // )
  }
}
