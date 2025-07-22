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

/**
 * @type {Document['createElement']}
 * @param {string} tagName
 */
export const createElement = (tagName) => document.createElement(tagName)
/**@param {*} string */
export const toLowerCase = (string) => string?.toLowerCase?.()

/**@type {<T>(instance: unknown, Class: new () => T) => instance is T} */
export const instanceOf = (instance, Class) => instance instanceof Class

/**@type {(value:any)=>value is string}  */
export const isString = (value) => typeof value == 'string'

/**@type {(value:any)=>value is object}  */
export const isObject = (value) => typeof value == 'object' && value
