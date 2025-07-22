import { isFunction } from './globals.js'

/**
 * @param {*} bool
 * @param {VChildren} children
 * @param {VChildren} elseChildren
 */
export function $if(bool, children, elseChildren) {
  if (bool) return isFunction(children) ? children() : children

  return typeof elseChildren == 'function' ? elseChildren() : elseChildren
}

/**
 * @template {*} T
 * @template {*} C
 * @param {Array<T>} list
 * @param {function(T, number, Array<T>): C} children
 */
export function $for(list, children) {
  return list.map(children)
}

/**
 * @param {*} value
 * @param {Record<string|symbol, VChildren>} cases
 */
export function $switch(value, cases) {
  const result = cases[value]
  return typeof result == 'function' ? result() : result
}
