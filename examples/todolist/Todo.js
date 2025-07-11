import { CustomElement, reactive } from '../../src/index.js'

const counter = reactive({ count: 0 })

export class Todo extends CustomElement {
  static tagName = 'todo-item'
  static attrs = {
    message: String,
    done: (v) => (v === null ? false : true),
    date: (v) => new Date(v),
  }
  item = { place: 'holder' }
  message = 'todo'
  done = false
  date = new Date()
  x = 1
  remove() {}
  render({ html, item, message, date, done }) {
    return html`
      <li
        style=${{
          textDecoration: item.done ? 'line-through' : 'none',
        }}
      >
        <button>${this.x}</button>
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
        <button onclick=${() => counter.count++}>${counter.count}</button>
        <input
          type="checkbox"
          checked=${done}
          attr=${done}
          onchange=${() => {
            this.emit('done')
          }}
        />
        ${new Date().getTime()}
      </li>
    `
  }
}
