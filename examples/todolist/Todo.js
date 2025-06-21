import { Component } from '../../src/Component.js'
import html from '../../src/html.js'

export class Todo extends Component {
  static attrs = {
    message: String,
    done: (v) => (v === null ? false : true),
    date: (v) => new Date(v),
  }
  message = 'todo'
  done = false
  date = new Date()
  remove() {}
  render({ message, date, done }) {
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
            this.dispatchEvent(new CustomEvent('done'))
          }}
        >
          ~
        </button>
        <button
          onclick=${() => {
            this.remove()
          }}
        >
          x
        </button>
      </li>
    `
  }
}
