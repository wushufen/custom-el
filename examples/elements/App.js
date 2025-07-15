import { CustomElement } from '../../src/CustomElement.js'
import { $for, $if, $switch } from '../../src/directives.js'
import { button, div, input, li, style, ul } from '../../src/elements.js'
import { TodoList } from '../todolist/TodoList.js'

export class App extends CustomElement {
  /**@type {(string|number)[]} */
  list = [0, 1, 2, 3]
  bool = true
  /**@param {this} options */
  render({}) {
    const { list, bool } = this

    return [
      Date.now(),

      div({
        children: [
          button({
            onclick() {
              list.shift()
            },
            children: () => '-',
          }),
          button({
            onclick() {
              list.unshift(list.length)
            },
            children: '+',
          }),
          $if(list.length, 'yes', 'no'),
          $switch(list.length, {
            0: 'no',
            1: 'yes',
          }),
          $for(list, (item) =>
            button({
              children: item,
            })
          ),
          input({
            onkeyup(e) {
              if (!(this instanceof HTMLInputElement)) return
              if (e.key == 'Enter') {
                list.push(this.value)
                this.value = ''
              }
            },
          }),
          ul({
            children: [
              $for(list, (item) =>
                li({
                  children: item,
                })
              ),
            ],
          }),
        ],
      }),

      style({
        children: /*css*/ `
          ul {
            list-style: none;
          }
          `,
      }),

      TodoList.el({
        children: [],
      }),

      CustomElement.el({
        tagName: TodoList,
      }),
    ]
  }
  static {
    this.define()
    document.body.appendChild(new this())
  }
}
