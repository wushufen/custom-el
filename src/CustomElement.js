import { h, propsKey, updateProps } from './createElement.js'
import { html } from './html.js'
import { Reactive } from './Reactive.js'

export class CustomElement extends HTMLElement {
  static get tagName() {
    const tagName = this.name.replace(/(.)([A-Z])/g, '$1-$2').toLowerCase()

    if (!/-/.test(tagName)) {
      return `${tagName}-el`
    }

    return tagName
  }
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
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
    this[name] = value

    this.update()
  }
  connectedCallback() {
    console.log('[connectedCallback]', this.constructor.name)
    this.update = this.update.bind(this)

    // watch props
    for (let [key, value] of Object.entries(this)) {
      Object.defineProperty(this, key, {
        get() {
          return Reactive.toReactive(value)
        },
        set(newValue) {
          value = newValue
          Reactive.watchEffect(this.update)
        },
      })
    }

    this.stop = Reactive.watchEffect(this.update)
  }
  disconnectedCallback() {
    console.log('[disconnectedCallback]', this.constructor.name)
    this.stop?.()
  }
  adoptedCallback() {}
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
    return html`<h1>Hello World</h1>`
  }
  /**
   */
  update() {
    console.warn('[update]', this.constructor.name)

    const shadowRoot = this.shadowRoot
    if (!shadowRoot) return

    const newChildNodes = /**@type {Node[]}*/ ([]).concat(this.render(this))
    console.warn('[newChildNodes]', this.constructor.name, newChildNodes)

    this.updateChildren(shadowRoot, shadowRoot.childNodes, newChildNodes)
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

    // !!
    if (!oldNode || !newNode) return

    // *text
    if (oldNode instanceof Text && newNode instanceof Text) {
      if (oldNode.textContent !== newNode.textContent) {
        oldNode.textContent = newNode.textContent
      }
      return
    }

    // *type
    if (oldNode.nodeType !== newNode.nodeType) {
      parent.replaceChild(newNode, oldNode)
      return
    }

    // *element
    if (oldNode instanceof Element && newNode instanceof Element) {
      if (oldNode.tagName !== newNode.tagName) {
        oldNode.replaceWith(newNode)
        return
      }

      // *props
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
   * @param {Child|Child[]} children
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
}
