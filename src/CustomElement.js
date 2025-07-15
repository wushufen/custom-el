import { defineProperty, toLowerCase } from './globals.js'
import { html } from './html.js'
import { patchChildren } from './patch.js'
import { reactive, watchEffect } from './reactivity.js'

export class CustomElement extends HTMLElement {
  constructor() {
    new.target.define()
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })

    // styles
    const Class = /**@type {typeof CustomElement}*/ (this.constructor)
    shadowRoot.adoptedStyleSheets = /**@type {CSSStyleSheet[]}*/ ([]).concat(
      Class.styles
    )
  }
  static get tagName() {
    const tagName = toLowerCase(this.name.replace(/([a-z])([A-Z])/g, '$1-$2'))

    if (!/-/.test(tagName)) {
      return `${tagName}-el`
    }

    return tagName
  }
  /**@type {CSSStyleSheet|CSSStyleSheet[]} */
  static styles = []
  /** attrs => props
   * @type {Record<string, (newValue: string?, oldValue: string?) => any>}
   */
  static attrs = {}
  static get observedAttributes() {
    return Object.keys(this.attrs)
  }
  /**
   * @param {string} name
   * @param {string?} oldValue
   * @param {string?} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    const attrs = /**@type {typeof CustomElement}*/ (this.constructor).attrs

    attrs[name]?.(newValue, oldValue)

    this.update()
  }
  connectedCallback() {
    console.warn('[connectedCallback]', this.constructor.name)

    const update = this.update
    DEV: defineProperty(update, 'name', {
      value: `<${this.constructor.name}>.update`,
    })

    // watch props
    for (let [key, value] of Object.entries(this)) {
      defineProperty(this, key, {
        get() {
          return reactive(value)
        },
        set(newValue) {
          if (value !== newValue) {
            value = newValue
            watchEffect(update)
          }
        },
      })
    }

    // watch
    this._unwatch = watchEffect(update)

    // onMounted() => onUnmounted
    this._onUnmounted = this.onMounted()
  }
  disconnectedCallback() {
    console.warn('[disconnectedCallback]', this.constructor.name)

    this._unwatch?.()

    this._onUnmounted?.()
    this.onUnmounted()
  }
  // adoptedCallback() {}
  /**
   * @returns {void|this['onUnmounted']}
   */
  onMounted() {}
  onUpdated() {}
  /**
   * @param {unknown} error
   */
  onError(error) {
    throw error
  }
  onUnmounted() {}
  /**
   * @type {typeof html}
   */
  html(...args) {
    return html(...args)
  }
  /**
   * @todo vNode
   * @param {this} props
   */
  render({ html }) {
    return html`<h1>!render</h1>`
  }
  /**
   * ()=>{} // bind(this)
   */
  update = () => {
    try {
      console.warn('[update]', this.constructor.name)

      const shadowRoot = this.shadowRoot
      if (!shadowRoot) return

      const newChildNodes = this.render(this)
      console.warn('[newChildNodes]', this.constructor.name, newChildNodes)

      patchChildren(shadowRoot, { children: newChildNodes })

      this.onUpdated()
    } catch (error) {
      this.onError(error)
    }
  }
  /**
   *
   * @param {string} eventName
   * @param {*} [detail]
   */
  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail }))
  }
  static define(tagName = this.tagName) {
    if (!customElements.getName(this)) {
      let name_ = tagName
      let i = 0
      while (customElements.get(tagName)) {
        tagName = name_ + ++i
      }

      customElements.define(tagName, this)
    }
  }
  // static isClass = true
}
