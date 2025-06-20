export class Select extends HTMLElement {
  template = /*html*/ `
    <style>
    select {
      width: 150px;
      background: #fff;
      border: solid 1px #bbb;
      border-radius: 3px;
    }
    </style>

    <select>
    </select>
  `
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.template
    }
  }
  static {
    customElements.define('w-select', this)
  }
}
