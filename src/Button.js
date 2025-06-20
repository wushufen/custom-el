export class Button extends HTMLElement {
  template = /*html*/ `
    <style>
    button{
      background: #fff;
      border: solid 1px #bbb;
      border-radius: 3px;
      cursor: pointer;
      &:active{
        scale: .98;
      }
    }
    </style>
    <button>
      <slot></slot>
    </button>
  `
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.template
    }
  }
  static {
    customElements.define('w-button', this)
  }
}
