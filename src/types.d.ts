type Tag = string | HTMLElement | typeof HTMLElement

type Class = Record<string, any>

type Style = Partial<HTMLElement['style']>

type Props = Omit<Partial<HTMLElement>, 'style' | 'children'> & {
  class?: Class
  style?: Style
  children?: Children
} & Record<string, any>

type Child = any

type Children = any[] | any

type X = number

interface ICustomElement {
  render(
    html: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement
  ): HTMLElement
}
