/**
 * @param {Tag} tag
 * @param {Props} props
 * @param {Children} children
 * @returns
 */
export function h(tag = '', props = {}, children = []) {
  if (!(children instanceof Array)) children = [children]

  let el
  // tag
  {
    // 'tagName'
    if (typeof tag === 'string') {
      el = document.createElement(tag)
    }
    // HTMLElement
    else if (tag instanceof HTMLElement) {
      el = tag
    }
    // Custom Element
    else if (tag.prototype instanceof HTMLElement) {
      let name = customElements.getName(tag)
      if (!name) {
        name = `x-${tag.name.toLowerCase()}`
        customElements.define(name, tag)
      }
      el = document.createElement(name)
    }
    // Unknown
    else {
      el = document.createElement('unknown')
    }
  }

  // props
  el[propsKey] = props
  for (const key of Object.keys(props)) {
    if (key === 'class') {
      for (const className of Object.keys(props.class)) {
        el.classList.add(className)
      }
      continue
    }

    if (key === 'style' && props.style) {
      for (const styleName of Object.keys(props.style)) {
        el.style[styleName] = props.style[styleName]
      }
      continue
    }

    // props
    // console.log(el, key, attrs[key])
    el[key] = props[key]
  }

  // children
  for (const child of children) {
    if (child instanceof Node) {
      el.appendChild(child)
    } else {
      const text = document.createTextNode(String(child ?? ''))
      el.appendChild(text)
    }
  }

  return el
}

export const propsKey = Symbol('props')

export * from './tags.js'
