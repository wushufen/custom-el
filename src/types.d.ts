type Tag = string | HTMLElement | typeof HTMLElement

type Class = Record<string, any>

type Style = Partial<HTMLElement['style']>

type Props = Omit<Partial<HTMLElement>, 'style'> & {
  class?: Class
  style?: Style
} & Record<string, any>

type Child = Tag | string | number | boolean | null | undefined

type Children = Child | Child[]

type X = number

interface ICustomElement {
  render(
    html: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement
  ): HTMLElement
}
