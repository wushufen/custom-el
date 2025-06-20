/**
 * @typedef {string|HTMLElement|typeof HTMLElement} Tag
 * @typedef {any} Class
 * @typedef {Partial<HTMLElement['style']>} Style
 * @typedef {Omit<Partial<HTMLElement>, 'style'> & {class?:Class, style?: Style} & Record<string, any>} Props
 * @typedef {Tag|string|number|boolean|null|undefined} Child
 * @typedef {Child|Child[]} Children
 */
