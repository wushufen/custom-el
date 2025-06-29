export class HelloWorld extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  name = 'World'
  /**
   * @param {this&{html:typeof html}} props
   */
  render({ html, name }) {
    return html`<h1>hello ${name}</h1>`
  }
}
