import { h } from './h.js'

export class Reactive extends HTMLElement {
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

export class Component extends Reactive {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = 'component'

    // debug
    window[this.constructor.name] = this.constructor
  }
  static get observedAttributes() {
    return this.props
  }
  static get props() {
    return ['x', 'y']
  }
  connectedCallback() {
    this.update()

    // proxy fields update
    for (let [key, value] of Object.entries(this)) {
      Object.defineProperty(this, key, {
        get() {
          return value
        },
        set(newValue) {
          value = newValue
          this.update()
        },
      })
    }
  }
  disconnectedCallback() {}
  adoptedCallback() {}
  attributeChangedCallback(name, oldValue, newValue) {
    const debug = true
    if (debug) {
      console.warn({ name, oldValue, newValue })
    }

    this[name] = newValue
    this.update()
  }
  /**
   * @todo vNode
   * @param {this} props
   */
  render(props) {
    return h('h1', { ...props }, ['Hello World'])
  }
  /**
   * @todo diff
   * @returns
   */
  update() {
    if (!this.shadowRoot) return
    this.shadowRoot.innerHTML = ''
    this.shadowRoot.append(this.render(this))
  }
  static h(attrs = {}, children = []) {
    return h(this, attrs, children)
  }
  static definedCustomElement(tagName) {
    customElements.define(tagName, this)
  }
  static {
    this.definedCustomElement('x-component')
  }
}
