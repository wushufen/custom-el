/** Custom element base class
 * @alias customUI
 * @alias customEl customEls
 */
export class Custom extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = this.render() ?? ''
  }
  html(template) {
    return template
  }
  render() {
    return html`
      <slot>Custom</slot>
      main
    `
  }
  static {
    customElements.define('w-custom', this)
  }
}

export function html(template) {
  return template
}

export function css(style) {
  return style
}
