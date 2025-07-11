import { CustomElement } from '../../src/index.js'
import { Header } from './Header.js'

export class App extends CustomElement {
  count = 0
  props = {
    title: 'hello world',
  }
  render({ html }) {
    return html`
      <button
        onclick=${() => {
          this.count++
        }}
      >
        ${this.count}
      </button>

      <button
        onclick=${() => {
          this.props.title = this.props.title.split('').reverse().join('')
        }}
      >
        reverse
      </button>

      <hr />

      <${Header} title=${this.props.title} />
    `
  }
}
