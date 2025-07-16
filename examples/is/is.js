import { CustomElement } from '../../src/index.js'

export class MyEl extends CustomElement {
  list = [1, 2, 3]
  /**@param {this} props */
  render({ html }) {
    const rs = html`
      <${MyButton} />
      <${MyButton}></${MyButton}>
      <${MyButton}><//>

      <hr />

      <component is=${MyButton}>button</component>
      <component is="my-button">button</component>

      <hr />

      <button is=${MyButton}>button</button>
      <button is="my-button">button</button>

      <hr />

      ${MyButton}
      ${() => 1}
    `

    console.log({ rs })
    return rs
  }
  static {
    document.body.appendChild(new this())
  }
}

class MyButton extends CustomElement {
  /**@param {this} props */
  render({ html }) {
    return html`
      <button class="my-button" style="background:#0af">
        <slot>my-button</slot>
      </button>
    `
  }
}
