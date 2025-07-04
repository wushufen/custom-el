import { CustomElement } from '../../src/index.js'

export class Todo extends CustomElement {
  static tagName = 'todo-item'
  static attrs = {
    message: String,
    done: (v) => (v === null ? false : true),
    date: (v) => new Date(v),
  }
  message = 'todo'
  done = false
  date = new Date()
  remove() {}
  render({ html, message, date, done }) {
    return html`
      <li
        style=${{
          textDecoration: done ? 'line-through' : 'none',
        }}
      >
        <span>${message}: </span>
        <small>${date.toLocaleString()}</small>
        <button
          onclick=${() => {
            this.emit('done')
          }}
        >
          ~
        </button>
        <button onclick=${() => this.remove()}>x</button>
      </li>
    `
  }
}
