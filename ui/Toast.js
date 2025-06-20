export class Toast extends HTMLElement {
  template = /*html*/ `
    <style>
    :host {
      display: table;
      max-width: 375px;
      margin: 0 auto;
      margin-bottom: 1ex;
      padding: .5em 1em;
      line-height: 1.25;
      border: solid 1px #444;
      border-radius: 5px;
      background: #333;
      color: #fff;
      box-shadow: 0px 1px 10px #333;
      box-shadow: 3px 5px 15px #666;
      transition: .3s;
      &:hover {
        opacity: .5;
      }
      &.hide {
        margin-top: -2.25em;
        margin-bottom: 0;
        opacity: 0;
      }
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
    customElements.define('w-toast', this)
  }
}
