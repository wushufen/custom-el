import { h, propsKey, updateProps } from './createElement.js'
import { defineProperty, instanceOf, toLowerCase } from './globals.js'
import { html } from './html.js'
import { reactive, watchEffect } from './reactivity.js'

export class CustomElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })

    // style
    const Class = /**@type {typeof CustomElement}*/ (this.constructor)
    shadowRoot.adoptedStyleSheets = /**@type {CSSStyleSheet[]}*/ ([]).concat(
      Class.style,
      Class.styles
    )
  }
  static get tagName() {
    const tagName = toLowerCase(this.name.replace(/(.)([A-Z])/g, '$1-$2'))

    if (!/-/.test(tagName)) {
      return `${tagName}-el`
    }

    return tagName
  }
  /**@type {CSSStyleSheet|CSSStyleSheet[]} */
  static styles = []
  /**@type {typeof this['styles']} */
  static style = []
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
    const converter = attrs[name]

    const value = converter(newValue, oldValue)
    // @ts-ignore
    this[name] = value

    this.update()
  }
  connectedCallback() {
    console.log('[connectedCallback]', this.constructor.name)

    const update = (this.update = this.update.bind(this))
    DEV: defineProperty(update, 'name', {
      value: `update[${this.constructor.name}]`,
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
    console.log('[disconnectedCallback]', this.constructor.name)
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
   */
  update() {
    try {
      console.warn('[update]', this.constructor.name)

      const shadowRoot = this.shadowRoot
      if (!shadowRoot) return

      const newChildNodes = /**@type {Node[]}*/ ([]).concat(this.render(this))
      console.warn('[newChildNodes]', this.constructor.name, newChildNodes)

      this.updateChildren(shadowRoot, shadowRoot.childNodes, newChildNodes)

      this.onUpdated()
    } catch (error) {
      this.onError(error)
    }
  }
  /**
   * @param {ParentNode} parent
   * @param {Node?} oldNode
   * @param {Node?} newNode
   */
  patch(parent, oldNode, newNode) {
    // -
    if (oldNode && !newNode) {
      console.warn('removeChild', { parent, oldNode, newNode })
      parent.removeChild(oldNode)
      return
    }

    // +
    if (!oldNode && newNode) {
      parent.appendChild(newNode)
      return
    }

    // *text
    if (instanceOf(oldNode, Text) && instanceOf(newNode, Text)) {
      if (oldNode.data !== newNode.data) {
        oldNode.data = newNode.data
      }
      return
    }

    // *type
    if (oldNode && newNode && oldNode.nodeType !== newNode.nodeType) {
      parent.replaceChild(newNode, oldNode)
      return
    }

    // *element
    if (instanceOf(oldNode, Element) && instanceOf(newNode, Element)) {
      if (oldNode.tagName !== newNode.tagName) {
        oldNode.replaceWith(newNode)
        return
      }

      // *props
      // @ts-ignore
      updateProps(oldNode, newNode[propsKey])

      // *childNodes
      this.updateChildren(oldNode, oldNode.childNodes, newNode.childNodes)
    }
  }
  /**
   *
   * @param {ParentNode} parent
   * @param {Node[]|NodeList} oldChildNodes
   * @param {Node[]|NodeList} newChildNodes
   */
  updateChildren(parent, oldChildNodes, newChildNodes) {
    oldChildNodes = [...oldChildNodes] // 避免循环过程中删除导致下标变动
    newChildNodes = [...newChildNodes] // 避免循环过程新节点添加到文档导致 NodeList 下标变动

    const length = Math.max(oldChildNodes.length, newChildNodes.length)

    for (let i = 0; i < length; i++) {
      this.patch(parent, oldChildNodes[i], newChildNodes[i])
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
  /**
   * @param {Props} props
   * @param {Children} children
   */
  static h(props = {}, children = []) {
    return h(this, props, children)
  }
  /**
   * @param {Function} Class
   */
  static beExtendedBy(Class) {
    Object.setPrototypeOf(Class.prototype, this.prototype)
  }
  static define(tagName = this.tagName) {
    customElements.define(tagName, this)
  }
  static isClass = true
}
