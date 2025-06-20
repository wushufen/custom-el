export class Input extends HTMLElement {
  template = /*html*/ `
    <style>
    input {
      width: 150px;
      background: #fff;
      border: solid 1px #bbb;
      border-radius: 3px;
    }
    </style>

    <input />
  `
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.template
    }
  }
  static {
    customElements.define('w-input', this)
  }
}
