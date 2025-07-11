import { CustomElement } from '../../src/index.js'

export class Header extends CustomElement {
  title = 'hello world'
  props = {
    count: 0,
  }
  render({ html }) {
    return html`
      <header>${this.title}</header>
      <button
        onclick=${() => {
          this.props.count++
        }}
      >
        ${this.props.count}
      </button>
    `
  }
}
