// https://github.com/developit/htm
// @ts-ignore
// await import('./importmap.js') // vscode 中报错
// import htm from 'htm'
// @ts-ignore
import htm from 'https://esm.sh/htm@3.1.1/es2015/mini.mjs'
import { h } from './createElement.js'

/**@type {(tpl:*)=>ReturnType<typeof h>} */
export const html = htm.bind(
  /**
   * @param {string} type
   * @param {Props} props
   * @param {...Children} children
   */
  function (type, props, ...children) {
    return h(
      type,
      props || {}, // null?
      // `a ${[1, 2, 3]} b` => ['a', [1, 2, 3], 'b'] => ['a', 1, 2, 3, 'b']
      children.flat()
    )
  }
)

export { htm }
export default html
