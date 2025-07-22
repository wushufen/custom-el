export const global = globalThis
export const window = global

export const Object = global.Object
export const Array = global.Array
export const Function = global.Function
export const String = global.String
export const Number = global.Number
export const Boolean = global.Boolean
export const Symbol = global.Symbol

export const Map = global.Map
export const Set = global.Set
export const WeakMap = global.WeakMap
export const WeakSet = global.WeakSet

export const Reflect = global.Reflect
export const Proxy = global.Proxy
export const Promise = global.Promise

export const Node = global.Node
export const Element = global.Element
export const HTMLElement = global.HTMLElement
export const SVGElement = global.SVGElement
export const Text = global.Text

export const document = global.document
export const customElements = global.customElements

export const reportError = global.reportError

export const defineProperty = Reflect.defineProperty
export const deleteProperty = Reflect.deleteProperty
export const apply = Reflect.apply
export const set = Reflect.set
export const get = Reflect.get
export const has = Reflect.has

export const createElement = document.createElement.bind(document)
/**@param {*} string */
export const toLowerCase = (string) => string?.toLowerCase?.()

/**@type {<T>(instance: unknown, Class: new () => T) => instance is T} */
export const instanceOf = (instance, Class) => instance instanceof Class

/**@param {*} value */
export const isArray = (value) => instanceOf(value, Array)

/**
 * @template {string} T
 * @param {any} value
 * @param {T} type
 * @returns {value is
 *   T extends "undefined" ? undefined :
 *   T extends "object" ? object | null :
 *   T extends "boolean" ? boolean :
 *   T extends "number" ? number :
 *   T extends "string" ? string :
 *   T extends "symbol" ? symbol :
 *   T extends "function" ? (...args:any[]) => any :
 *   never
 * }
 */
const typeOf = (value, type) => typeof value === type
/**@type {(value:any)=> value is (undefined|null)}  */
export const isNil = (value) => typeOf(value, 'undefined') || value === null
/**@param {*} value */
export const isString = (value) => typeOf(value, 'string')
/**@param {*} value */
export const isBoolean = (value) => typeOf(value, 'boolean')
/**@param {*} value */
export const isNumber = (value) => typeOf(value, 'number')
/**@param {*} value */
export const isSymbol = (value) => typeOf(value, 'symbol')
/**@param {*} value */
export const isFunction = (value) => typeOf(value, 'function')
/**@param {*} value */
export const isObject = (value) => typeOf(value, 'object') && value !== null
