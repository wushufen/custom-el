const addEventListener = EventTarget.prototype.addEventListener
const removeEventListener = EventTarget.prototype.removeEventListener

/**
 * @param {string} type
 * @param {EventListener} listener
 */
EventTarget.prototype.addEventListener = function (type, listener) {
  console.warn('addEventListener', type, listener)

  const eventsMap = this['#eventsMap'] || (this['#eventsMap'] = {})

  Object.defineProperty(this, '#eventsMap', {
    value: eventsMap,
    enumerable: false,
  })

  /**@type {Set<Function>} */
  const events = eventsMap[type] || (eventsMap[type] = new Set())

  events.add(listener)

  return addEventListener.apply(this, arguments)
}

/**
 * @param {string} type
 * @param {EventListener} listener
 */
EventTarget.prototype.removeEventListener = function (type, listener) {
  console.warn('removeEventListener', type, listener)

  const eventsMap = this['#eventsMap'] || (this['#eventsMap'] = {})
  Object.defineProperty(this, '#eventsMap', {
    value: eventsMap,
    enumerable: false,
  })

  /**@type {Set<Function>} */
  const events = eventsMap[type] || (eventsMap[type] = new Set())

  if (listener && !events.has(listener)) {
    console.error('removeEventListener: 事件不存在', type, listener)
    debugger
  }
  events.delete(listener)

  return removeEventListener.apply(this, arguments)
}
