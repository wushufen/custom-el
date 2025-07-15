// https://github.com/developit/htm
// @ts-ignore
// await import('./importmap.js') // vscode 中报错
// import htm from 'htm'
// @ts-ignore
import htm from 'https://esm.sh/htm@3.1.1/es2015/mini.mjs'

/**@type {(strings: TemplateStringsArray, ...values: any[]) => VChildren} */
export const html = htm.bind(
  /**
   * @param {string|typeof Element} tagName
   * @param {VElement?} props
   * @param {...VChildren} children
   */
  function (tagName, props, ...children) {
    return {
      children,
      ...props, // null?
      tagName,
    }
  }
)

export { htm }
export default html
