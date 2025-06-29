import { CustomElement } from '../../src/index.js'

export class MyEl extends CustomElement {
  list = [1, 2, 3]
  render({ html }) {
    return html`
      <${MyButton} />
      <${MyButton}></${MyButton}>
      <${MyButton}><//>
      <component is=${MyButton}>button</component>
      <component is="my-button">button</component>
      <button is=${MyButton}>button</button>
      <button is="my-button">button</button>
    `
  }
  static {
    this.define()
  }
}

class MyButton extends CustomElement {
  render({ html }) {
    return html`
      <button style="color:red">
        <slot>my-button</slot>
      </button>
    `
  }
}
