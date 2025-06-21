import { h, propsKey, updateProps } from './h.js'

export class Component extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = 'component'

    // debug
    window[this.constructor.name] = this.constructor
  }
  /** attrs => props
   * @type {Record<string, Function>}
   */
  static props = {}
  static get observedAttributes() {
    return Object.keys(this.props)
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    console.warn(name, _oldValue, newValue)
    const props = /**@type {typeof Component}*/ (this.constructor).props

    const Type = props[name]
    const value = Type(newValue)
    this[name] = value

    this.update()
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
    // this.shadowRoot.innerHTML = ''
    // this.shadowRoot.appendChild(this.render(this))

    this.patch(this.shadowRoot, this.shadowRoot.firstChild, this.render(this))
  }
  /**
   * @param {ParentNode} parent
   * @param {Node?} oldNode
   * @param {Node?} newNode
   */
  patch(parent, oldNode, newNode) {
    // -
    if (oldNode && !newNode) {
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
      const oldChildNodes = Array.from(oldNode.childNodes)
      const newChildNodes = Array.from(newNode.childNodes)
      for (
        let i = 0;
        i < Math.max(oldChildNodes.length, newChildNodes.length);
        i++
      ) {
        this.patch(oldNode, oldChildNodes[i], newChildNodes[i])
      }
    }
  }
  /**
   * @param {Props} props
   * @param {Child|Child[]} children
   */
  static h(props = {}, children = []) {
    return h(this, props, children)
  }
  static defineCustomElement(tagName) {
    customElements.define(tagName, this)
  }
  static {
    this.defineCustomElement('x-component')
  }
}
