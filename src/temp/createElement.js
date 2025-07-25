import { createElement, defineProperty, instanceOf } from '../globals.js'

/**
 * @param {Tag} tag
 * @param {Props} props
 * @param {Children} children
 * @returns {Node}
 */
export function h(tag = '', props = {}, children = []) {
  children = props.children ?? children
  delete props.children
  if (!instanceOf(children, Array)) children = [children]
  children = children.flat()

  /**@type {Element&{[propsKey]?:Props}} */
  let el
  // tag
  {
    // 'tagName'
    if (typeof tag === 'string') {
      el = createElement(tag)
    }
    // HTMLElement
    else if (instanceOf(tag, HTMLElement)) {
      el = tag
    }
    // Custom Element
    else if (instanceOf(tag.prototype, HTMLElement)) {
      el = new tag()
    }
    // Unknown
    else {
      el = createElement('unknown')
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
      child = instanceOf(child, Node) ? child : new Text(child ?? '') // ?? 返回空文本节点避免整体结构变化太大
      parent.appendChild(child)
    }

    // ${()=>{}}
    if (instanceOf(child, Function)) {
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

export { h as createElement }

/**
 * @param {Element&{[propsKey]?:Props}} el
 * @param {Props} props
 */
export function updateProps(el, props) {
  if (!el[propsKey]) {
    DEV: el[propsKey] = {} // ts
    defineProperty(el, propsKey, {
      value: {},
      enumerable: false,
    })
  }

  for (const key in props) {
    const value = props[key]
    const oldValue = el[propsKey][key]

    // for.of if
    if (['for.of', 'if'].includes(key)) {
      continue
    }

    // class
    if (key === 'class' && value) {
      for (const className in value) {
        if (oldValue?.[className] != value[className]) {
          el.classList.toggle(className, value[className])
        }
      }
      continue
    }

    // style
    if (
      key === 'style' &&
      value &&
      (instanceOf(el, HTMLElement) || instanceOf(el, SVGElement))
    ) {
      for (const styleName in value) {
        if (oldValue?.[styleName] != value[styleName]) {
          // @ts-ignore
          el.style[styleName] = value[styleName]
        }
      }
      continue
    }

    // on @
    const on_ = /^(on|@)/
    if (on_.test(key)) {
      const type = key.replace(on_, '')
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
        if ([true, false, null, undefined].includes(value)) {
          el.toggleAttribute(key, value)
        } else {
          el.setAttribute(key, value)
        }
      }
    }
  }

  el[propsKey] = props
}

export const propsKey = Symbol('#props')
