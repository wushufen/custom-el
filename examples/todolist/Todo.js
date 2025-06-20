import { Component } from '../../src/Component.js'
import { li, slot } from '../../src/h.js'

export class Todo extends Component {
  static observedAttributes = ['message', 'done']
  message = 'todo'
  done = false
  render({ message, done }) {
    return li({}, [slot(), ': ', message, done ? ' (done)' : ''])
  }
}
