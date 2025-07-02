// @ts-nocheck
import { CustomElement } from '../../src/index.js'

export class Loop extends CustomElement {
  list = [1, 2, 3, 4, 5]
  bool = true
  /**
   * @param {this} props
   */
  render({ html, list, bool }) {
    return html`
      <ul for.of=${list.entries()}>
        ${([i, item]) => {
          return html`<li>i: ${i}, item: ${item}</li>`
        }}
      </ul>
      <button if=${bool}>
        ${() => {
          return bool
        }}
      </button>
      <button
        onclick=${() => {
          this.bool = !this.bool
          list.push(list.length)
        }}
      >
        ${bool}
      </button>
    `
  }
  static {
    this.define()
  }
}
