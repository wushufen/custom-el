export class Tooltip extends HTMLElement {
  template = /*html*/ `
    <style>
    :host {
      position: fixed;
      z-index: 9999;
      margin-top: -1ex;
      display: inline-block;
      max-width: 480px;
      font-size: 12px;
      line-height: 1.375;
      padding: .375ex 1.5ex;
      background: rgba(0, 0, 0, 0.75);
      border-radius: 5px;
      color: #fff;
      filter: drop-shadow(5px 5px 5px #666);
      transition: .3s;
      &:after {
        content: "";
        position: absolute;
        top: 100%;
        left: 1em;
        left: 50%;
        margin-left: -.75ex;
        border: solid .75ex transparent;
        border-top-color: #333;
        border-bottom: 0;
      }
      &.hide {
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
    customElements.define('w-tooltip', this)
  }
}
