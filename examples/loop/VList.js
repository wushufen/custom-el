import { CustomElement } from '../../src/index.js'

export class Loop extends CustomElement {
  list = [1, 2, 3]
  render({ html }) {
    return html`
      <v-list data=${this.list}> ${(item) => html`<li>${item}</li>`} </v-list>
    `
  }
  static {
    this.define()
  }
}
