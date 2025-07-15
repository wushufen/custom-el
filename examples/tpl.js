// @ts-nocheck
// oxlint-disable

class MyCom {}

const list = [1, 2, 3]

const render =
  /**@type {()=>VNode} */
  function render() {
    return {
      tagName: 'ul',
      style: {},
      onclick() {
        console.log('click')
      },
      children: list.map((item) => ({
        tagName: 'li',
        children: `item: ${item}`,
      })),
    }
  } ||
  /**@type {()=>VNode} */
  function render() {
    return ul({
      class: 'container',
      onclick() {
        console.log('click')
      },
      if: true,
      for: list.entries(),
      children: ([key, item]) =>
        new MyCom({
          children: `key: ${key}, item: ${item}`,
        }),
    })
  } ||
  /**@type {()=>VNode} */
  function render() {
    return html`
      <ul
        class="container"
        onclick=${function () {
          console.log('click')
        }}
      >
        ${list.map((item) => html`<li>item: ${item}</li>`)}
      </ul>
    `
  } ||
  /**@type {()=>string} */
  function render() {
    return /*html*/ `
      <ul class="container" @click="onclick">
        <li v-for="item of list">item: {{item}}</li>
      </ul>
    `
  } ||
  /**@type {()=>string} */
  function render() {
    return 'jsx...'
  }
