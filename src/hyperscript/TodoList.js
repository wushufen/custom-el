import { Component } from './Component.js'
import { input, main, ul } from './h.js'
import { Todo } from './Todo.js'

export class TodoList extends Component {
  constructor() {
    super()
  }
  inputText = 'input'
  list = ['a', 'b', 'c']
  render() {
    return main({}, [
      this.inputText,
      input({
        value: this.inputText,
        oninput: (e) => {
          this.inputText = e.target.value
        },
        onkeydown: (e) => {
          if (e.key === 'Enter') {
            this.list = [...this.list, this.inputText]
            this.inputText = ''
          }
        },
      }),
      ul(
        {
          class: {
            list: true,
          },
          style: {
            border: 'solid 1px',
          },
        },
        this.list.map((item, i) => Todo.h({ message: item }, [i]))
      ),
    ])
  }
  static {
    this.definedCustomElement('x-todo-list')
  }
}
