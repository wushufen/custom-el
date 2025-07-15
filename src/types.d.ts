type VElement = Partial<Omit<HTMLElement, 'style' | 'class' | 'children'>> & {
  style?: Partial<HTMLElement['style']>
  class?: string | Record<string, any> | Array<string | Record<string, any>>
  children?: VChildren
  [key: string]: any
}
type VNode = VElement | string | number | boolean | null | undefined

type VChildren =
  | VNode
  | VNode[]
  | VNode[][] // [][]: ['s', list.map(), 'e']
  | (() => VChildren)
