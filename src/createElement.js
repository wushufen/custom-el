import { Extra } from './Extra.js'

/**
 * @param {Tag} tag
 * @param {Props} props
 * @param {Children} children
 * @returns
 */
export function createElement(tag = '', props = {}, children = []) {
  if (!(children instanceof Array)) children = [children]

  /**@type {Node} */
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
    if (child instanceof Function) {
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
    el = new Text()
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
      const oldHandler = Extra.get(el)[onKey]

      el.removeEventListener(type, oldHandler)
      el.addEventListener(type, newHandler)
      Extra.get(el)[onKey] = newHandler
      continue
    }

    // props
    if (key in el) {
      const oldValue = el[key]
      if (value !== oldValue) {
        el[key] = props[key]
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
}

// export const propsKey = Symbol('props')

/**@type{*} */
export const propsKey = '#props'
