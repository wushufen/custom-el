// import './interceptEvents.js'

export * from './createElement.js'
export * from './CustomElement.js'
export * from './html.js'
export * from './reactivity.js'
// default *
export * as default from './index.js'

import * as module from './index.js'
for (const key in module) {
  window[key] = module[key]
}
