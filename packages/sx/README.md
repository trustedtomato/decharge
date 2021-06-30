# SX

SX is a very-static site generator.
It doesn't emit JavaScript by default but is built on JSX,
so the result is just SX I guess.

## Why?
I tried out Astro, but the IDE support was real bad on my computer,
dynamic routes were not the way I'd like and (in my opinion) it had a
lot of unneccessary bloat going on.
I tried to fix these issues with this project.

## Goals
- Keep the core package bloatless.
- Don't add anything to the core which would result in an unwanted chunk of output when building.
- Don't add any feature which hasn't got neat IDE support (syntax highlighting, autocompletion and linting).

## Usage
By default, your static files live in `public/`
and everything else in `src/`. Your routes should
be in `src/routes/`.

### Routing
Every route should be a `.tsx` file, containing something like this:
```tsx
// src/routes/index.tsx

import Head from '../components/Head.tsx'

// The route should be "export default"-ed.
// Note that this can be async like this if you'd like.
export default async () => <html>
  <head>
    <Head title="Welcome">
  </head>
  <body>
    Hello World!
  </body>
</html>
```

#### Dynamic routing = routes outputting multiple pages
You can have route paths like `about/[author].tsx` or even
`about/[author]/posts/[postSlug]/appendix-[appendixNumber].tsx`
(this should be familiar to Next.js users).
So, when there are [square bracketed] parts in the route's path
(relative to the routes directory), you can replace those
using an additional export called `paramsList`.
```tsx
// src/routes/about/[authorSlug]/posts/[postSlug]/footnotes-[footnoteNumber].tsx

export paramsList = [{
  // This "params" generates: dist/about/alexander-pushkin/posts/eugene-onegin/footnotes-21/index.html
  authorSlug: 'alexander-pushkin',
  postSlug: 'eugene-onegin',
  footnoteNumber: 21,
  // Note that this could be any other, arbitary attribute.
  // The point is that the whole params object gets passed
  // to the "export default"-ed function.
  content: `Pushkin wrote at least 18 stanzas of a never-completed tenth chapter. \
It contained many satires and even direct criticism on contemporary Russian rulers, \
including the Emperor himself. Afraid of being prosecuted for dissidence, \
Pushkin burnt most of the tenth chapter. Very little of it survived in Pushkin's notebooks.`
}, {
  // This "params" generates: dist/about/queen/posts/bohemian/rhapsody/footnotes-13/index.html
  authorSlug: 'queen',
  // Note that you can even put slashes here.
  // Plus, in the final path multiple adjacent slashes will be
  // merged into one, so having 'bohemian//rhapsody' would have the same effect.
  postSlug: 'bohemian/rhapsody',
  footnoteNumber: 13,
  content: `He played the beginning on the piano, then stopped and said, \
  'And this is where the opera section comes in!' Then we went out to eat dinner.`
}]

export default ({ authorSlug, postSlug, footnoteNumber, content }) => <>
  Here, footnote number {footnoteNumber} refers to: {content}
</>
```