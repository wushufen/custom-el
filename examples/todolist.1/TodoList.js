import { CustomElement } from '../../src/index.js'
import { Todo } from './Todo.js'

export class TodoList extends CustomElement {
  input = 'input'
  list = [
    { message: 'a', date: new Date(), done: false },
    // { message: 'b', date: new Date(), done: true },
    // { message: 'c', date: new Date(), done: false },
  ]
  render({ html }) {
    return html`
      <div>
        <ul>
          ${this.list.map(
            (item) =>
              html`<${Todo}
                done=${item.done}
                @done=${() => {
                  console.log('@done', this.list)
                  item.done = !item.done

                  // 此行会导致 onclick 多少触发，在点击 ~ 按钮时
                  this.list = this.list.filter((i) => i !== item)
                }}
                remove=${() => {
                  this.list.splice(this.list.indexOf(item), 1)
                }}
                onclick=${(/**@type {MouseEvent}*/ e) => {
                  console.log('onclick', this.list)
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
