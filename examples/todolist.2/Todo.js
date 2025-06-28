import { CustomElement } from '../../src/index.js'

export class Todo extends CustomElement {
  done = false
  remove() {}
  render({ html, item, message, date, done }) {
    return html`
      <li
        style=${{
          textDecoration: done ? 'line-through' : 'none',
        }}
      >
        <span>${done} </span>
        <button onclick=${() => this.remove()}>x</button>
      </li>
    `
  }
}
