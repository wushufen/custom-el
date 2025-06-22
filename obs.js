// 用于存储对象与其反应之间的连接关系，使用 WeakMap 确保对象被垃圾回收时，对应的连接也会被自动清理
const connectionStore = new WeakMap()
// 定义一个唯一的迭代键，用于处理迭代操作时的反应注册
const ITERATION_KEY = Symbol('iteration key')

// 为给定的对象存储可观察状态，为对象创建一个新的 Map 来保存其键与反应的连接
function storeObservable(obj) {
  // 后续将用于保存 (obj.key -> reaction) 连接
  connectionStore.set(obj, new Map())
}

// 为操作注册反应，将反应与目标对象的键关联起来
function registerReactionForOperation(reaction, { target, key, type }) {
  // 如果操作类型是迭代，则使用迭代键
  if (type === 'iterate') {
    key = ITERATION_KEY
  }

  // 获取目标对象的反应映射
  const reactionsForObj = connectionStore.get(target)
  // 获取键对应的反应集合
  let reactionsForKey = reactionsForObj.get(key)
  if (!reactionsForKey) {
    reactionsForKey = new Set()
    reactionsForObj.set(key, reactionsForKey)
  }
  // 确保反应只被添加一次
  if (!reactionsForKey.has(reaction)) {
    reactionsForKey.add(reaction)
    reaction.cleaners.push(reactionsForKey)
  }
}

// 获取操作对应的反应集合
function getReactionsForOperation({ target, key, type }) {
  // 获取目标对象的反应映射
  const reactionsForTarget = connectionStore.get(target)
  // 创建一个新的反应集合
  const reactionsForKey = new Set()

  // 如果操作类型是清除，则将所有键的反应添加到集合中
  if (type === 'clear') {
    reactionsForTarget.forEach((_, key) => {
      addReactionsForKey(reactionsForKey, reactionsForTarget, key)
    })
  } else {
    addReactionsForKey(reactionsForKey, reactionsForTarget, key)
  }

  // 如果操作类型是添加、删除或清除，则添加迭代键的反应
  if (type === 'add' || type === 'delete' || type === 'clear') {
    const iterationKey = Array.isArray(target) ? 'length' : ITERATION_KEY
    addReactionsForKey(reactionsForKey, reactionsForTarget, iterationKey)
  }

  return reactionsForKey
}

// 将指定键的反应添加到目标集合中
function addReactionsForKey(reactionsForKey, reactionsForTarget, key) {
  const reactions = reactionsForTarget.get(key)
  reactions && reactions.forEach(reactionsForKey.add, reactionsForKey)
}

// 释放反应与对象键之间的连接
function releaseReaction(reaction) {
  if (reaction.cleaners) {
    reaction.cleaners.forEach(releaseReactionKeyConnection, reaction)
  }
  reaction.cleaners = []
}

// 从指定的反应集合中移除当前反应
function releaseReactionKeyConnection(reactionsForKey) {
  reactionsForKey.delete(this)
}

// 反应调用栈，用于跟踪正在运行的反应
const reactionStack = []
// 调试标志，用于控制调试操作
let isDebugging = false

// 将函数作为反应运行
function runAsReaction(reaction, fn, context, args) {
  // 如果反应未被观察，则直接执行函数
  if (reaction.unobserved) {
    return Reflect.apply(fn, context, args)
  }

  // 避免反应递归调用
  if (reactionStack.indexOf(reaction) === -1) {
    // 释放反应与对象键之间的连接
    releaseReaction(reaction)

    try {
      // 将反应推入调用栈
      reactionStack.push(reaction)
      return Reflect.apply(fn, context, args)
    } finally {
      // 从调用栈中移除反应
      reactionStack.pop()
    }
  }
}

// 为当前正在运行的反应注册操作
function registerRunningReactionForOperation(operation) {
  // 获取调用栈顶部的反应
  const runningReaction = reactionStack[reactionStack.length - 1]
  if (runningReaction) {
    debugOperation(runningReaction, operation)
    registerReactionForOperation(runningReaction, operation)
  }
}

// 为操作队列化反应
function queueReactionsForOperation(operation) {
  // 遍历操作对应的反应集合，并队列化每个反应
  getReactionsForOperation(operation).forEach(queueReaction, operation)
}

// 队列化单个反应，根据调度器类型执行反应
function queueReaction(reaction) {
  debugOperation(reaction, this)
  // 队列化反应以便后续执行或立即运行
  if (typeof reaction.scheduler === 'function') {
    reaction.scheduler(reaction)
  } else if (typeof reaction.scheduler === 'object') {
    reaction.scheduler.add(reaction)
  } else {
    reaction()
  }
}

// 调试操作，调用反应的调试器函数
function debugOperation(reaction, operation) {
  if (reaction.debugger && !isDebugging) {
    try {
      isDebugging = true
      reaction.debugger(operation)
    } finally {
      isDebugging = false
    }
  }
}

// 检查是否有正在运行的反应
function hasRunningReaction() {
  return reactionStack.length > 0
}

// 用于标记函数是否为反应的符号
const IS_REACTION = Symbol('is reaction')

// 创建一个可观察的反应
function observe(fn, options = {}) {
  // 如果传入的函数已经是反应，则直接使用
  const reaction = fn[IS_REACTION]
    ? fn
    : function reaction() {
        return runAsReaction(reaction, fn, this, arguments)
      }
  // 保存调度器和调试器到反应对象
  reaction.scheduler = options.scheduler
  reaction.debugger = options.debugger
  // 标记该函数为反应
  reaction[IS_REACTION] = true
  // 如果不是懒加载，则立即运行反应
  if (!options.lazy) {
    reaction()
  }
  return reaction
}

// 取消观察反应，释放反应与对象键之间的连接
function unobserve(reaction) {
  // 如果反应已经是未观察状态，则不做任何操作
  if (!reaction.unobserved) {
    // 标记反应为未观察状态
    reaction.unobserved = true
    // 释放反应与对象键之间的连接
    releaseReaction(reaction)
  }
  // 如果有调度器对象，则从调度器中删除反应
  if (typeof reaction.scheduler === 'object') {
    reaction.scheduler.delete(reaction)
  }
}

// 用于存储代理对象到原始对象的映射
const proxyToRaw = new WeakMap()
// 用于存储原始对象到代理对象的映射
const rawToProxy = new WeakMap()

// 获取对象原型的 hasOwnProperty 方法
const hasOwnProperty = Object.prototype.hasOwnProperty

// 查找对象的可观察代理
function findObservable(obj) {
  const observableObj = rawToProxy.get(obj)
  if (hasRunningReaction() && typeof obj === 'object' && obj !== null) {
    if (observableObj) {
      return observableObj
    }
    return observable(obj)
  }
  return observableObj || obj
}

// 修补迭代器，确保迭代器返回的对象是可观察的
function patchIterator(iterator, isEntries) {
  const originalNext = iterator.next
  iterator.next = () => {
    let { done, value } = originalNext.call(iterator)
    if (!done) {
      if (isEntries) {
        value[1] = findObservable(value[1])
      } else {
        value = findObservable(value)
      }
    }
    return { done, value }
  }
  return iterator
}

const instrumentations = {
  has(key) {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为当前操作注册正在运行的反应
    registerRunningReactionForOperation({ target, key, type: 'has' })
    // 调用原型的 has 方法并返回结果
    return proto.has.apply(target, arguments)
  },
  get(key) {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为当前操作注册正在运行的反应
    registerRunningReactionForOperation({ target, key, type: 'get' })
    // 返回可观察的结果
    return findObservable(proto.get.apply(target, arguments))
  },
  add(key) {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 检查原始对象是否已经包含该键
    const hadKey = proto.has.call(target, key)
    // 先执行添加操作
    const result = proto.add.apply(target, arguments)
    // 如果是新添加的键，则队列化反应
    if (!hadKey) {
      queueReactionsForOperation({ target, key, value: key, type: 'add' })
    }
    return result
  },
  set(key, value) {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 检查原始对象是否已经包含该键
    const hadKey = proto.has.call(target, key)
    // 获取原始对象中该键的旧值
    const oldValue = proto.get.call(target, key)
    // 先执行设置操作
    const result = proto.set.apply(target, arguments)
    // 如果是新添加的键，则队列化反应
    if (!hadKey) {
      queueReactionsForOperation({ target, key, value, type: 'add' })
    } else if (value !== oldValue) {
      // 如果值发生了变化，则队列化反应
      queueReactionsForOperation({ target, key, value, oldValue, type: 'set' })
    }
    return result
  },
  delete(key) {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 检查原始对象是否包含该键
    const hadKey = proto.has.call(target, key)
    // 获取原始对象中该键的旧值
    const oldValue = proto.get ? proto.get.call(target, key) : undefined
    // 先执行删除操作
    const result = proto.delete.apply(target, arguments)
    // 如果键存在且被删除，则队列化反应
    if (hadKey) {
      queueReactionsForOperation({ target, key, oldValue, type: 'delete' })
    }
    return result
  },
  clear() {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 检查原始对象是否包含元素
    const hadItems = target.size !== 0
    // 保存原始对象的副本
    const oldTarget = target instanceof Map ? new Map(target) : new Set(target)
    // 先执行清除操作
    const result = proto.clear.apply(target, arguments)
    // 如果原始对象包含元素，则队列化反应
    if (hadItems) {
      queueReactionsForOperation({ target, oldTarget, type: 'clear' })
    }
    return result
  },
  forEach(cb, ...args) {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为迭代操作注册正在运行的反应
    registerRunningReactionForOperation({ target, type: 'iterate' })
    // 包装回调函数，将原始值替换为可观察的值
    const wrappedCb = (value, ...rest) => cb(findObservable(value), ...rest)
    // 调用原型的 forEach 方法
    return proto.forEach.call(target, wrappedCb, ...args)
  },
  keys() {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为迭代操作注册正在运行的反应
    registerRunningReactionForOperation({ target, type: 'iterate' })
    // 调用原型的 keys 方法并返回结果
    return proto.keys.apply(target, arguments)
  },
  values() {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为迭代操作注册正在运行的反应
    registerRunningReactionForOperation({ target, type: 'iterate' })
    // 获取原型的 values 迭代器
    const iterator = proto.values.apply(target, arguments)
    // 修补迭代器并返回
    return patchIterator(iterator, false)
  },
  entries() {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为迭代操作注册正在运行的反应
    registerRunningReactionForOperation({ target, type: 'iterate' })
    // 获取原型的 entries 迭代器
    const iterator = proto.entries.apply(target, arguments)
    // 修补迭代器并返回
    return patchIterator(iterator, true)
  },
  [Symbol.iterator]() {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为迭代操作注册正在运行的反应
    registerRunningReactionForOperation({ target, type: 'iterate' })
    // 获取原型的迭代器
    const iterator = proto[Symbol.iterator].apply(target, arguments)
    // 修补迭代器并返回
    return patchIterator(iterator, target instanceof Map)
  },
  get size() {
    // 获取代理对象对应的原始对象
    const target = proxyToRaw.get(this)
    // 获取当前对象的原型
    const proto = Reflect.getPrototypeOf(this)
    // 为迭代操作注册正在运行的反应
    registerRunningReactionForOperation({ target, type: 'iterate' })
    // 返回原型的 size 属性值
    return Reflect.get(proto, 'size', target)
  },
}

var collectionHandlers = {
  get(target, key, receiver) {
    // 如果 key 存在于 instrumentations 中，则使用 instrumentations 作为目标对象
    target = hasOwnProperty.call(instrumentations, key)
      ? instrumentations
      : target
    // 反射获取属性值并返回
    return Reflect.get(target, key, receiver)
  },
}

// eslint-disable-next-line
// 获取全局对象，在浏览器环境中为 window，在其他环境中为全局作用域
const globalObj =
  typeof window === 'object' ? window : Function('return this')()

// 内置对象不能被 Proxy 包装，因为它们的方法期望 this 是对象实例而不是 Proxy 包装器
// 复杂对象使用包含插入方法的 Proxy 进行包装，这些方法会将 Proxy 切换为原始对象并添加反应连接
const handlers = new Map([
  [Map, collectionHandlers],
  [Set, collectionHandlers],
  [WeakMap, collectionHandlers],
  [WeakSet, collectionHandlers],
  [Object, false],
  [Array, false],
  [Int8Array, false],
  [Uint8Array, false],
  [Uint8ClampedArray, false],
  [Int16Array, false],
  [Uint16Array, false],
  [Int32Array, false],
  [Uint32Array, false],
  [Float32Array, false],
  [Float64Array, false],
])

// 检查对象是否应该被插入反应逻辑
function shouldInstrument({ constructor }) {
  // 判断对象的构造函数是否为内置构造函数
  const isBuiltIn =
    typeof constructor === 'function' &&
    constructor.name in globalObj &&
    globalObj[constructor.name] === constructor
  // 如果不是内置对象或者在 handlers 映射中存在对应的处理程序，则应该插入反应逻辑
  return !isBuiltIn || handlers.has(constructor)
}

// 获取对象的处理程序
function getHandlers(obj) {
  return handlers.get(obj.constructor)
}

const hasOwnProperty$1 = Object.prototype.hasOwnProperty
// 获取 Symbol 对象的所有已知符号
const wellKnownSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map((key) => Symbol[key])
    .filter((value) => typeof value === 'symbol')
)

// 拦截可观察对象的 get 操作，以便知道哪个反应使用了它们的属性
function get(target, key, receiver) {
  // 反射获取属性值
  const result = Reflect.get(target, key, receiver)
  // 对于已知符号，不注册 (observable.prop -> reaction) 对
  // 这些符号经常在底层 JavaScript 中被检索
  if (typeof key === 'symbol' && wellKnownSymbols.has(key)) {
    return result
  }
  // 注册并保存 (observable.prop -> runningReaction)
  registerRunningReactionForOperation({ target, key, receiver, type: 'get' })
  // 如果当前在反应中，并且 observable.prop 是一个对象，则也将其包装为可观察对象
  // 这是为了拦截对该对象的属性访问 (动态可观察树)
  const observableResult = rawToProxy.get(result)
  if (hasRunningReaction() && typeof result === 'object' && result !== null) {
    if (observableResult) {
      return observableResult
    }
    // 不违反不可配置、不可写属性的 get 处理程序不变性
    // 在这种情况下，回退到非反应模式，而不是让 Proxy 抛出 TypeError
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key)
    if (
      !descriptor ||
      !(descriptor.writable === false && descriptor.configurable === false)
    ) {
      return observable(result)
    }
  }
  // 否则返回已创建并缓存的可观察包装器或原始对象
  return observableResult || result
}

function has(target, key) {
  // 反射检查对象是否具有指定的键
  const result = Reflect.has(target, key)
  // 注册并保存 (observable.prop -> runningReaction)
  registerRunningReactionForOperation({ target, key, type: 'has' })
  return result
}

function ownKeys(target) {
  // 为迭代操作注册正在运行的反应
  registerRunningReactionForOperation({ target, type: 'iterate' })
  // 反射获取对象的所有自有键
  return Reflect.ownKeys(target)
}

// 拦截可观察对象的 set 操作，以便知道何时触发反应
function set(target, key, value, receiver) {
  // 确保不会用可观察对象污染原始对象
  if (typeof value === 'object' && value !== null) {
    value = proxyToRaw.get(value) || value
  }
  // 检查对象是否已经有该键的描述符
  const hadKey = hasOwnProperty$1.call(target, key)
  // 保存该键的旧值
  const oldValue = target[key]
  // 在运行任何反应之前执行 set 操作
  const result = Reflect.set(target, key, value, receiver)
  // 如果操作的目标不是原始接收者（可能由于原型继承），则不队列化反应
  if (target !== proxyToRaw.get(receiver)) {
    return result
  }
  // 如果是新属性或其值发生了变化，则队列化反应
  if (!hadKey) {
    queueReactionsForOperation({ target, key, value, receiver, type: 'add' })
  } else if (value !== oldValue) {
    queueReactionsForOperation({
      target,
      key,
      value,
      oldValue,
      receiver,
      type: 'set',
    })
  }
  return result
}

function deleteProperty(target, key) {
  // 检查对象是否有该键
  const hadKey = hasOwnProperty$1.call(target, key)
  const oldValue = target[key]
  // 在运行任何反应之前执行删除操作
  const result = Reflect.deleteProperty(target, key)
  // 仅在删除操作导致实际更改时队列化反应
  if (hadKey) {
    queueReactionsForOperation({ target, key, oldValue, type: 'delete' })
  }
  return result
}

var baseHandlers = { get, has, ownKeys, set, deleteProperty }

// 创建一个可观察对象
function observable(obj = {}) {
  // 如果对象已经是可观察对象或者不应该被包装，则返回它
  if (proxyToRaw.has(obj) || !shouldInstrument(obj)) {
    return obj
  }
  // 如果对象已经有缓存的可观察包装器，则返回它；否则创建一个新的可观察对象
  return rawToProxy.get(obj) || createObservable(obj)
}

function createObservable(obj) {
  // 如果是复杂的内置对象或普通对象，则包装它
  const handlers = getHandlers(obj) || baseHandlers
  const observable = new Proxy(obj, handlers)
  // 保存这些映射，以便稍后轻松在原始对象和包装对象之间切换
  rawToProxy.set(obj, observable)
  proxyToRaw.set(observable, obj)
  // 初始化基本数据结构，以便稍后保存和清理 (observable.prop -> reaction) 连接
  storeObservable(obj)
  return observable
}

// 检查对象是否为可观察对象
function isObservable(obj) {
  return proxyToRaw.has(obj)
}

// 获取对象的原始版本
function raw(obj) {
  return proxyToRaw.get(obj) || obj
}

// 导出可观察对象相关的函数
export { isObservable, observable, observe, raw, unobserve }
