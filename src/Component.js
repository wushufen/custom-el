import { h, propsKey, updateProps } from './h.js'
import html from './html.js'

export class Component extends HTMLElement {
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
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = 'component'

    // debug
    window[this.constructor.name] = this.constructor
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
    const attrs = /**@type {typeof Component}*/ (this.constructor).attrs
    const converter = attrs[name]

    const value = converter(newValue, oldValue)
    this[name] = value

    this.update()
  }
  connectedCallback() {
    this.update()

    // watch props
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
   * @param {typeof html} html
   * @param {this} props
   */
  render(html, props) {
    props === this
    return html`<h1>Hello World</h1>`
  }
  /**
   * @todo diff
   * @returns
   */
  update() {
    if (!this.shadowRoot) return
    // this.shadowRoot.innerHTML = ''
    // this.shadowRoot.appendChild(this.render(this))

    this.patch(
      this.shadowRoot,
      this.shadowRoot.firstChild,
      this.render(html, this)
    )
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
  static defineCustomElement(tagName = this.tagName) {
    customElements.define(tagName, this)
  }
  static {
    this.defineCustomElement('x-component')
  }
}
