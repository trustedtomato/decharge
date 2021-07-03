import { compile, stringify, serialize } from 'stylis'

export function transformStyle (style: string, className: string): string {
  return serialize(
    compile(style),
    (element) => {
      if (element.type === 'rule' && element.value.includes('.this')) {
        return serialize([{
          ...element,
          props: (element.props as any as string[]).map(prop => prop.replace(/\.this(?![a-z])/i, `.${className}`))
        }], stringify)
      }
      return serialize([element], stringify)
    }
  )
}

export default transformStyle
