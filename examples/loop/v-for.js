import { CustomElement } from '../../src/index.js'

export class Loop extends CustomElement {
  list = [1, 2, 3]
  render({ html }) {
    return html`
      <ul v-for=${this.list}>
        ${(item) => html`<li>${item}</li>`}
      </ul>
    `
  }
  static {
    this.define()
  }
}
