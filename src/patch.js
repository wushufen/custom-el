import {
  createElement,
  defineProperty,
  instanceOf,
  set,
  toLowerCase,
} from './globals.js'

/**
 * @param {Node?} parent
 * @param {Node} oldNode
 * @param {unknown} newNode
 * @example
 * patch(parent, oldLength, newNode) // update
 * patch(null, node, props) // createNode
 */
export function patch(parent, oldNode, newNode) {
  // *type
  if (!isSameNode(oldNode, newNode)) {
    parent?.replaceChild(createNode(newNode), oldNode)
    return
  }

  // *element
  if (instanceOf(oldNode, Element)) {
    if (typeof newNode != 'object' || !newNode) return

    // *props
    patchProps(oldNode, newNode)

    // *childNodes
    if (
      !(
        'textContent' in newNode ||
        'innerText' in newNode ||
        'innerHTML' in newNode
      )
    ) {
      patchChildren(oldNode, newNode)
    }
    return
  }

  // *text
  if (instanceOf(oldNode, Text)) {
    patchText(oldNode, newNode)
    return
  }
}

/**
 * @param {Element&{[propsKey]?:Record<*, *>}} oldNode
 * @param {object} newNode
 */
export function patchProps(oldNode, newNode) {
  const oldProps = oldNode[propsKey] || {}
  saveProps(oldNode, newNode)

  for (const key in newNode) {
    const oldValue = oldProps[key]
    const newValue = /**@type {*}*/ (newNode)[key]

    // class
    if (key === 'class' && newValue) {
      for (const className in newValue) {
        if (oldValue?.[className] != newValue[className]) {
          oldNode.classList.toggle(className, newValue[className])
        }
      }
      continue
    }

    // style
    if (
      key === 'style' &&
      newValue &&
      (instanceOf(oldNode, HTMLElement) || instanceOf(oldNode, SVGElement))
    ) {
      for (const styleName in newValue) {
        if (oldValue?.[styleName] != newValue[styleName]) {
          oldNode.style[
            /**@type {keyof Element['computedStyleMap']}*/ (styleName)
          ] = newValue[styleName]
        }
      }
      continue
    }

    // on @
    const on_ = /^(on|@)(?=.)/
    if (on_.test(key)) {
      const type = key
        .replace(on_, '') // - on @
        .replace(/^./, toLowerCase) // Click => click

      const oldHandler = oldProps[key]

      oldNode.removeEventListener(type, oldHandler)
      oldNode.addEventListener(type, newValue)
      continue
    }

    // props
    if (key in oldNode) {
      // 1. always new
      // 2. TypeError: Cannot set property children of #<Object> which has only a getter
      if (key == 'children') continue

      if (newValue !== oldValue) {
        // strict mode
        // TypeError: Cannot set property tagName of #<Object> which has only a getter
        set(oldNode, key, newValue)
      }
    } else {
      const oldValue = oldNode.getAttribute(key)
      if (oldValue !== newValue) {
        if ([true, false, null, undefined].includes(newValue)) {
          oldNode.toggleAttribute(key, newValue)
        } else {
          oldNode.setAttribute(key, newValue)
        }
      }
    }
  }
}

/**
 * @param {Node} oldNode
 * @param {{children?:*,childNodes?:*}} newNode
 */
export function patchChildren(oldNode, newNode) {
  const oldChildNodes = [...oldNode.childNodes]
  let newChildNodes = newNode.children ?? newNode.childNodes

  if (instanceOf(newChildNodes, Function)) {
    newChildNodes = newChildNodes()
  }

  if (newChildNodes?.[Symbol.iterator] && typeof newChildNodes != 'string') {
    // flat: `a ${[1, 2, 3]} b` => ['a', [1, 2, 3], 'b'] => ['a', 1, 2, 3, 'b']
    newChildNodes = [...newChildNodes].flat()
  } else {
    newChildNodes = [newChildNodes]
  }

  const oldLength = oldChildNodes.length
  const newLength = newChildNodes.length
  const maxLength = Math.max(oldLength, newLength)

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildNodes[i]
    const newChild = newChildNodes[i]

    // -
    if (i > newLength - 1) {
      oldNode.removeChild(oldChild)
      continue
    }

    // +
    if (i > oldLength - 1) {
      oldNode.appendChild(createNode(newChild))
      continue
    }

    patch(oldNode, oldChild, newChild)
  }
}

/**
 * @param {Text} oldNode
 * @param {unknown} newNode
 */
export function patchText(oldNode, newNode) {
  const string = instanceOf(newNode, Text)
    ? newNode.data
    : String(newNode ?? '')

  if (oldNode.data !== string) {
    oldNode.data = string
  }
}

/**
 * @param {unknown} object
 */
export function createNode(object) {
  let node

  if (instanceOf(object, Node)) {
    return object
  }

  // text
  if (typeof object !== 'object' || !object) {
    return new Text(String(object ?? ''))
  }
  // element
  else if (typeof object === 'object' && 'tagName' in object) {
    const tagName = object.tagName

    // CustomElement
    if (
      instanceOf(/**@type {typeof Element}*/ (tagName).prototype, HTMLElement)
    ) {
      node = new /**@type {typeof Element}*/ (tagName)()
    }
    // tagName
    else {
      node = createElement(String(tagName || 'div'))
    }
  }

  if (node) {
    patch(null, node, object)

    return node
  }

  return new Comment(String(object))
}

/**
 * @param {Node} oldNode
 * @param {unknown} newNode
 * @example
 * isSameNode(div, {tagName: 'div'}) // true
 * isSameNode(div, {tagName: 'span'}) // false
 * isSameNode(text, {tagName: 'div'}) // false
 * isSameNode(text, 'text2'}) // true
 * isSameNode(customEl, {tagName: CustomEl}) // true
 */
export function isSameNode(oldNode, newNode) {
  // *text
  if (!newNode || typeof newNode != 'object') {
    return instanceOf(oldNode, Text)
  }

  // *tagName
  if ('tagName' in newNode) {
    const tagName = /**@type {string|typeof Element}*/ (newNode.tagName)
    if (instanceOf(tagName, Function) && instanceOf(oldNode, tagName)) {
      return true
    }
    return toLowerCase(oldNode.nodeName) == toLowerCase(tagName)
  }

  // *nodeType
  if ('nodeType' in newNode) {
    return oldNode.nodeType == newNode.nodeType
  }
}

/**
 * @param {Node&{[propsKey]?:VElement}} node
 * @param {object} props
 */
export function saveProps(node, props) {
  if (propsKey in props) {
    defineProperty(node, propsKey, {
      value: props,
      writable: true,
    })
    return
  }

  node[propsKey] = props
}

export const propsKey = Symbol('#props')
