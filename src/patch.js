import {
  createElement,
  defineProperty,
  instanceOf,
  isObject,
  isString,
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
  // function
  if (instanceOf(newNode, Function)) {
    newNode = newNode()
  }

  // *type
  if (!isSameNode(oldNode, newNode)) {
    parent?.replaceChild(createNode(newNode), oldNode)
    return
  }

  // *element
  if (instanceOf(oldNode, Element)) {
    // customElement vs CustomElement
    if (!isObject(newNode)) return

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
      if (isString(newValue)) {
        oldNode.className = newValue
        continue
      }

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
      if (isString(newValue)) {
        oldNode.style = newValue
        continue
      }

      for (const [styleName, styleValue] of Object.entries(newValue)) {
        if (oldValue?.[styleName] != styleValue) {
          oldNode.style.setProperty(styleName, styleValue)
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
 * @returns {Node}
 */
export function createNode(object) {
  // function | CustomElement
  if (instanceOf(object, Function)) {
    // CustomElement
    if (instanceOf(object.prototype, Element)) {
      return new /** @type {new () => Node} */ (object)()
    }
    // ()=>1
    else {
      return createNode(object())
    }
  }

  // node
  if (instanceOf(object, Node)) {
    return object
  }

  // element
  // @ts-ignore
  const tagName = object?.is || object?.tagName
  if (tagName) {
    let node

    // CustomElement
    if (instanceOf(tagName.prototype, Element)) {
      node = new tagName()
    }
    // tag
    else {
      node = createElement(String(tagName || 'div'))
    }

    // props
    if (node) {
      patch(null, node, object)

      return node
    }
  }

  // text
  if (!isObject(object)) {
    return new Text(String(object ?? ''))
  }

  // unknown
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
 * isSameNode(customElement, {tagName: CustomElement}) // true
 * isSameNode(customElement, CustomElement) // true
 */
export function isSameNode(oldNode, newNode) {
  // CustomElement
  if (oldNode.constructor == newNode) return true

  // *text
  if (!isObject(newNode)) {
    return instanceOf(oldNode, Text)
  }

  // *tagName
  // @ts-ignore
  const tagName = newNode?.is || newNode?.tagName
  if (tagName) {
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
