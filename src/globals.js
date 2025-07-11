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

export const createElement = document.createElement.bind(document)
export const defineProperty = Reflect.defineProperty
/**@param {string} string */
export const toLowerCase = (string) => string?.toLowerCase()

/**@type {<T>(instance: unknown, Class: new () => T) => instance is T} */
export const instanceOf = (instance, Class) => instance instanceof Class
