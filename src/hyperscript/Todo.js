import { Component } from './Component.js'
import { li, slot } from './h.js'

export class Todo extends Component {
  static props = ['message']
  message = 'todo'
  render({ message }) {
    return li({}, [slot(), ': ', message])
  }
}
