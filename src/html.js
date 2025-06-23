// https://github.com/developit/htm
// @ts-ignore
// await import('./importmap.js') // vscode 中报错
// @ts-ignore
const htm = await import('https://esm.sh/htm@3.1.1/es2015/mini.mjs').then(
  (m) => m.default
)
import { h } from './createElement.js'

export const html = htm.bind(function (type, props, ...children) {
  return h(
    type,
    props || {}, // null?
    // `a ${[1, 2, 3]} b` => ['a', [1, 2, 3], 'b'] => ['a', 1, 2, 3, 'b']
    children.flat()
  )
})

export { htm }
export default html
