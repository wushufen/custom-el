class ReactiveElement extends HTMLElement {
  constructor() {
    super()

    // https://github.com/WICG/webcomponents/issues/857#issuecomment-560012716
    Object.setPrototypeOf(
      this,
      new Proxy(Object.create(HTMLElement.prototype), {
        // 拦截对象属性的读取
        get(target, property, receiver) {
          if (property === Symbol.toStringTag) {
            return Reflect.get(target, property, receiver)
          }

          return Reflect.get(target, property, receiver)
        },
        // 拦截对象属性的设置
        set(target, property, value, receiver) {
          console.log(
            `Proxy set: property = ${String(property)}`,
            'value =',
            value,
            'target =',
            target,
            'receiver =',
            receiver
          )
          return Reflect.set(target, property, value, receiver)
        },
        // 拦截 in 操作符
        has(target, property) {
          console.log(
            `Proxy has: property = ${String(property)}`,
            'target =',
            target
          )
          return Reflect.has(target, property)
        },
        // 拦截 delete 操作符
        deleteProperty(target, property) {
          console.log(
            `Proxy deleteProperty: property = ${String(property)}`,
            'target =',
            target
          )
          return Reflect.deleteProperty(target, property)
        },
        // 拦截 Object.getOwnPropertyDescriptor()
        getOwnPropertyDescriptor(target, property) {
          console.log(
            `Proxy getOwnPropertyDescriptor: property = ${String(property)}`,
            'target =',
            target
          )
          return Reflect.getOwnPropertyDescriptor(target, property)
        },
        // 拦截 Object.defineProperty()
        defineProperty(target, property, descriptor) {
          console.log(
            `Proxy defineProperty: property = ${String(property)}`,
            'descriptor =',
            descriptor,
            'target =',
            target
          )
          return Reflect.defineProperty(target, property, descriptor)
        },
        // 拦截 Object.getPrototypeOf()
        getPrototypeOf(target) {
          console.log('Proxy getPrototypeOf:', 'target =', target)
          return Reflect.getPrototypeOf(target)
        },
        // 拦截 Object.setPrototypeOf()
        setPrototypeOf(target, prototype) {
          console.log(
            'Proxy setPrototypeOf:',
            'prototype =',
            prototype,
            'target =',
            target
          )
          return Reflect.setPrototypeOf(target, prototype)
        },
        // 拦截 Object.isExtensible()
        isExtensible(target) {
          console.log('Proxy isExtensible:', 'target =', target)
          return Reflect.isExtensible(target)
        },
        // 拦截 Object.preventExtensions()
        preventExtensions(target) {
          console.log('Proxy preventExtensions:', 'target =', target)
          return Reflect.preventExtensions(target)
        },
        // 拦截 Object.keys()、Object.getOwnPropertyNames()、Object.getOwnPropertySymbols()
        ownKeys(target) {
          console.log('Proxy ownKeys:', 'target =', target)
          return Reflect.ownKeys(target)
        },
        // 拦截函数调用
        apply(target, thisArg, argumentsList) {
          console.log(
            'Proxy apply:',
            'target =',
            target,
            'thisArg =',
            thisArg,
            'argumentsList =',
            argumentsList
          )
          return Reflect.apply(target, thisArg, argumentsList)
        },
        // 拦截 new 操作符
        construct(target, argumentsList, newTarget) {
          console.log(
            'Proxy construct:',
            'target =',
            target,
            'argumentsList =',
            argumentsList,
            'newTarget =',
            newTarget
          )
          return Reflect.construct(target, argumentsList, newTarget)
        },
      })
    )
  }
}

customElements.define('reactive-element', ReactiveElement)
el = new ReactiveElement()
dir(el)
