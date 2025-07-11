/**
 * @param {Tag} tag
 * @param {Props} props
 * @param {Children} children
 */
export function createElement(tag = '', props = {}, children = []) {
  if (!(children instanceof Array)) children = [children]

  /**@type {Element&{[propsKey]?:Props}} */
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

  // #props
  updateProps(/**@type {Element&{[propsKey]:Props}}*/ (el), props)

  // children
  for (let child of children) {
    /**
     * @param {Node} parent
     * @param {*} child
     */
    function append(parent, child) {
      child = child instanceof Node ? child : new Text(child ?? '') // ?? 返回空文本节点避免整体结构变化太大
      parent.appendChild(child)
    }

    // ${()=>{}}
    if (typeof child == 'function') {
      // for.of
      const list = props['for.of']
      if (list) {
        for (const item of list) {
          append(el, child(item))
        }
      }

      // ()={}
      else {
        append(el, child())
      }
    } else {
      append(el, child)
    }
  }

  // if
  if ('if' in props && props['if'] == false) {
    return new Text()
  }

  return el
}

export { createElement as h }

/**
 * @param {Element&{[propsKey]:Props}} el
 * @param {Props} props
 */
export function updateProps(el, props) {
  if (!el[propsKey]) {
    Object.defineProperty(el, propsKey, {
      value: {},
      enumerable: false,
      writable: true,
    })
  }

  for (const key of Object.keys(props)) {
    const value = props[key]
    const oldValue = el[propsKey][key]

    // for.of if
    if (['for.of', 'if'].includes(key)) {
      continue
    }

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
      for (const styleName in props.style) {
        const styleValue = props.style[styleName]
        if (styleValue !== undefined) el.style[styleName] = styleValue
      }
      continue
    }

    // on @
    if (key.startsWith('on') || key.startsWith('@')) {
      const type = key.replace(/^(on|@)/, '')
      const oldHandler = el[propsKey][key]

      el.removeEventListener(type, oldHandler)
      el.addEventListener(type, value)
      el[propsKey][key] = value
      continue
    }

    // props
    if (key in el) {
      if (value !== oldValue) {
        // @ts-ignore
        el[key] = value
      }
    } else {
      const oldValue = el.getAttribute(key)
      if (oldValue !== value) {
        if ([false, null, undefined].includes(value)) {
          el.removeAttribute(key)
        } else {
          el.setAttribute(key, value === true ? '' : value)
        }
      }
    }
  }

  el[propsKey] = props
}

export const propsKey = Symbol('#props')
