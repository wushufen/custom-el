import { CustomElement } from '../../src/index.js'
import { Todo } from './Todo.js'

export class TodoList extends CustomElement {
  list = [
    { message: 'a', date: new Date(), done: false },
    // { message: 'b', date: new Date(), done: true },
    // { message: 'c', date: new Date(), done: false },
  ]
  set = new Set(this.list)
  render({ html }) {
    const item = this.list[0]

    return html`
      <div>
        <ul>
          ${item &&
          html`<${Todo}
            remove=${() => {
              this.list.splice(this.list.indexOf(item), 1)
            }}
          />`}
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
