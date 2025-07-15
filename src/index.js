// import './interceptEvents.js'

export * from './CustomElement.js'
export * from './html.js'
export * from './patch.js'
export * from './reactivity.js'
// default *
// export * as default from './index.js'

import * as module from './index.js'
// @ts-ignore
DEV: window.defel = module
DEV: for (const key in module) {
  // @ts-ignore
  window[key] = module[key]
}
