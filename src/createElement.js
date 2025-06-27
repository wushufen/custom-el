/**
 * @param {Tag} tag
 * @param {Props} props
 * @param {Children} children
 * @returns
 */
export function createElement(tag = '', props = {}, children = []) {
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
        name =
          /**@type {typeof import('./CustomElement.js').CustomElement}*/ (tag)
            .tagName || `x-${tag.name.toLowerCase()}`
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
  updateProps(el, props)

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

export { createElement as h }

/**
 * @param {Element} el
 * @param {Props} props
 */
export function updateProps(el, props) {
  for (const key of Object.keys(props)) {
    const value = props[key]

    // class
    if (key === 'class' && props.class) {
      for (const className of Object.keys(props.class)) {
        el.classList.add(className)
      }
      continue
    }

    // style
    if (
      key === 'style' &&
      props.style &&
      (el instanceof HTMLElement || el instanceof SVGElement)
    ) {
      for (const styleName of /**@type {*} */ (Object.keys(props.style))) {
        el.style[styleName] = props.style[styleName]
      }
      continue
    }

    // on @
    if (key.startsWith('on') || key.startsWith('@')) {
      const type = key.replace(/^(on|@)/, '')
      const onKey = `@${type}`
      const newHandler = props[key]
      const oldHandler = el[propsKey][onKey]

      el.removeEventListener(type, oldHandler)
      el.addEventListener(type, newHandler)

      el[propsKey][onKey] = newHandler
      continue
    }

    // props
    const oldValue = el[key]
    if (value !== oldValue) {
      el[key] = props[key]
    }
  }
}

// export const propsKey = Symbol('props')

/**@type{*} */
export const propsKey = '#props'
