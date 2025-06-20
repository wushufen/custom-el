import { Component } from '../../src/Component.js'
import { input, main, ul } from '../../src/h.js'
import { Todo } from './Todo.js'

export class TodoList extends Component {
  inputText = 'input'
  list = ['a', 'b', 'c']
  render({ inputText }) {
    return main({}, [
      this.inputText,
      input({
        type: 'checkbox',
        checked: !!inputText,
      }),
      input({
        value: this.inputText,
        oninput: (e) => {
          if (!(e.target instanceof HTMLInputElement)) return
          this.inputText = e.target.value
        },
        onkeydown: (e) => {
          if (e.key === 'Enter') {
            this.list = [...this.list, inputText]
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
        [
          'start',
          ...this.inputText
            .split('')
            .map((item, i) => Todo.h({ message: item }, [i])),
          'end',
          Todo.h(
            {
              style: {},
              message: 'end',
              onclick() {
                alert(this.message)
              },
            },
            ['end']
          ),
        ]
      ),
    ])
  }
}
