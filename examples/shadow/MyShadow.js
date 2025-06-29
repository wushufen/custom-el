export class CustomFragment {
  render() {}
  update() {}
  updateChildren() {}
}

export class CustomShadow extends CustomFragment {
  /**
   * @type {Node?}
   */
  targetRoot = null
  /**
   * @param {HTMLElement} el
   */
  attach(el) {
    const shadowRoot = el.attachShadow({ mode: 'open' })
    this.targetRoot = shadowRoot
    this.update()
  }
  /**
   * @param {HTMLElement} el
   */
  static attach(el) {
    new this().attach(el)
  }
}

export class Child extends CustomShadow {
  render() {
    return document.createElement('button')
  }
}

export class Parent extends CustomShadow {
  render() {
    return html`
      <div>
        <div is=${Child}></div>
      </div>
    `
  }
}

Parent.attach(document.body)
