import { Scripts, Styles } from 'decharge'
import type { ComponentChildren } from 'preact'

interface Props {
  extraTitle?: string
  description: string
  children: ComponentChildren
}

export default ({ extraTitle, description, children }: Props) =>
  <html lang="en">
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    {/* TODO: create separate stylesheets for different screen sizes using media="..." */}
    <link rel="stylesheet" href="/global.css" />
    <Styles />
    <title>{ extraTitle ? `${extraTitle} — ` : ''}decharge</title>
    {children}
    <Scripts />
  </html>
