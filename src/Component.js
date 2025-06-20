import { h, propsKey } from './h.js'

export class Component extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = 'component'

    // debug
    window[this.constructor.name] = this.constructor
  }
  static get observedAttributes() {
    return ['value']
  }
  attributeChangedCallback(name, oldValue, newValue) {
    const debug = true
    if (debug) {
      console.warn({ name, oldValue, newValue })
    }

    // convert type
    const value = this[name]
    if (newValue == 'null') newValue = null
    if (newValue == 'undefined') newValue = undefined
    if (typeof value == 'number') newValue = Number(newValue)
    if (typeof value == 'boolean') {
      if (!newValue || newValue == 'false') newValue = false
      else newValue = true
    }

    this[name] = newValue
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

    this.patch(this.shadowRoot.firstChild, this.render(this), this.shadowRoot)
  }
  /**
   * @param {Node?} oldNode
   * @param {Node?} newNode
   * @param {Node} parentElement
   */
  patch(oldNode, newNode, parentElement) {
    // -
    if (oldNode && !newNode) {
      parentElement.removeChild(oldNode)
      return
    }

    // +
    if (!oldNode && newNode) {
      parentElement.appendChild(newNode)
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
      parentElement.replaceChild(newNode, oldNode)
      return
    }

    // *element
    if (oldNode instanceof Element && newNode instanceof Element) {
      if (oldNode.tagName !== newNode.tagName) {
        oldNode.replaceWith(newNode)
        return
      }

      // *props
      for (const key of Object.keys(newNode[propsKey])) {
        const newProp = newNode[key]
        if (oldNode[key] !== newProp) {
          oldNode[key] = newProp
        }
      }

      // *childNodes
      const oldChildNodes = Array.from(oldNode.childNodes)
      const newChildNodes = Array.from(newNode.childNodes)
      for (
        let i = 0;
        i < Math.max(oldChildNodes.length, newChildNodes.length);
        i++
      ) {
        this.patch(oldChildNodes[i], newChildNodes[i], oldNode)
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
