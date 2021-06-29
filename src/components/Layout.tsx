import type { Children } from '../types/Children';

interface Props {
  extraTitle?: string
  description: string
  children: Children
}

export default ({ extraTitle, description, children }: Props) =>
  <html lang="en">
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="preload" href="/fonts/EB_Garamond.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    {/* TODO: create separate stylesheets for different screen sizes using media="..." */}
    <link rel="stylesheet" href="/styles/global.css" />
    {/* TODO: deliver this js inline. */}
    <script src="/scripts/global.js"></script>
    <title>{ extraTitle ? `${extraTitle} - ` : ''}Tamás Halasi</title>
    {children}
  </html>