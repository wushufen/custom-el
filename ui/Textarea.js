export class Textarea extends HTMLElement {
  template = /*html*/ `
    <style>
    textarea {
      width: 150px;
      background: #fff;
      border: solid 1px #bbb;
      border-radius: 3px;
    }
    </style>

    <textarea />
  `
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.template
    }
  }
  static {
    customElements.define('w-textarea', this)
  }
}
