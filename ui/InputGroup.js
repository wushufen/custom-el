export class InputGroup extends HTMLElement {
  template = /*html*/ `
    <style>
    :host{
      display: flex;
    }
    </style>

    <slot></slot>
  `
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.template
    }
  }
  static {
    customElements.define('w-input-group', this)
  }
}
