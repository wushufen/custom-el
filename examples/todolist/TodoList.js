import { CustomElement } from '../../src/index.js'
import { Todo } from './Todo.js'

export class TodoList extends CustomElement {
  input = 'input'
  list = [
    { message: 'a', date: new Date(), done: false },
    { message: 'b', date: new Date(), done: true },
    { message: 'c', date: new Date(), done: false },
  ]
  set = new Set(this.list)
  render({ html }) {
    return html`
      <div>
        <input
          type="text"
          value=${this.input}
          oninput=${(/**@type {KeyboardEvent}*/ e) => {
            if (!(e.target instanceof HTMLInputElement)) return
            this.input = e.target.value
          }}
          onkeyup=${(/**@type {KeyboardEvent}*/ e) => {
            if (e.key === 'Enter') {
              this.list.push({
                message: this.input,
                date: new Date(),
                done: false,
              })
              this.input = ''
            }
          }}
        />
        <h1>input: ${this.input}</h1>
        <ul>
          ${this.list.map(
            (item) =>
              html`<${Todo}
                item=${item}
                message=${item.message}
                date=${item.date || new Date()}
                done=${item.done}
                @done=${() => {
                  item.done = !item.done
                  console.log('@done', this.list, item)
                }}
                remove=${() => {
                  this.list.splice(this.list.indexOf(item), 1)
                }}
                onclick=${(/**@type {MouseEvent}*/ e) => {
                  console.log(e)
                }}
              />`
          )}
        </ul>
      </div>
      <style>
        ul {
          border: solid 1px;
          border-radius: 10px;
        }
      </style>
    `
  }
}
