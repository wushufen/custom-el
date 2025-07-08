// @ts-nocheck
import { CustomElement } from '../../src/index.js'

export class Loop extends CustomElement {
  list = [1, 2, 3, 4, 5]
  bool = true
  log() {
    console.log(this, arguments)
  }
  /**
   * @param {this} props
   */
  render({ html, list, bool }) {
    this.log.bind(this)(this.log)

    return html`
      <ul for.of=${list}>
        ${(item) => html`<li>${item}</li>`}
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

      <div for.of=${list}>${(item) => item}</div>

      <div for.in=${object}>${(key) => html`${key}:${object[key]}`}</div>

      <div>
        <button if=${bool}>1</button>
        <button elseif=${bool}>2</button>
        <button else>3</button>
      </div>

      <div switch=${bool}>
        <span case=${true}>yes</span>
        <span case=${false}>no</span>
        <span default>-</span>
      </div>
    `
  }
  static {
    this.define()
  }
}
