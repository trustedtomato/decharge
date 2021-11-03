import { Scripts, Styles } from 'decharge'
import { ComponentChildren } from 'preact'

interface Props {
  extraTitle?: string
  description?: string
  children: ComponentChildren
}

export default ({ extraTitle, description, children }: Props) =>
  <html lang="en">
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    { description
      ? <meta name="description" content={description} />
      : <meta name="description" content="TEMPLATE_PLACEHOLDER(projectDescription)" />
    }
    <link rel="shortcut icon" href="favicon.svg" />
    <Styles />
    <title>{ extraTitle ? `${extraTitle} — ` : ''}TEMPLATE_PLACEHOLDER(projectName)</title>
    {children}
    <Scripts type="end-of-body" />
  </html>
