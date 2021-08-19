## Usage
By default, your static files live in `public/`
and everything else in `src/`. Your routes should
be in `src/routes/`^[These can be configured, see [Configuration](#docs-configuration).].

### Routing
Every route should be a `.tsx` file, containing something like this:
```tsx
// src/routes/index.tsx

import Head from '../components/Head.tsx'

// The route should be "export default"-ed.
export default () => <html>
  <head>
    <Head title="Welcome">
  </head>
  <body>
    Hello World!
  </body>
</html>
```
You can use any "export default"-ed Preact component as route
(because the route will be rendered using Preact),
but using tsx is the easiest way to define one.
For absolute type safety, you can annotate your route with
`SimpleRoute`, which can imported from the decharge package.

#### Dynamic routing = routes outputting multiple pages
You can have route paths like `about/[author].tsx` or even
`about/[author]/posts/[postSlug]/appendix-[appendixNumber].tsx`
(this should be familiar to Next.js users).
So, when there are [square bracketed] parts in the route's path
(relative to the routes directory), you can replace those
by default exporting a dataList along with your page component
like this:
```tsx
// src/routes/about/[authorSlug]/posts/[postSlug]/footnotes-[footnoteNumber].tsx

import type { DynamicRoute } from 'decharge'

interface Data {
  authorSlug: string
  postSlug: string
  footnoteNumber: number
  content: string
}

const route: DynamicRoute<Data> = {
  dataList: [{
    // This "data" generates:
    // dist/about/alexander-pushkin/posts/eugene-onegin/footnotes-21/index.html
    authorSlug: 'alexander-pushkin',
    postSlug: 'eugene-onegin',
    footnoteNumber: 21,
    // Note that this could be any other, arbitary attribute.
    // The point is that the whole data object gets passed
    // to the "export default"-ed function.
    content: `Pushkin wrote at least 18 stanzas of a never-completed tenth chapter. \
It contained many satires and even direct criticism on contemporary Russian rulers, \
including the Emperor himself. Afraid of being prosecuted for dissidence, \
Pushkin burnt most of the tenth chapter. Very little of it survived in Pushkin's notebooks.`
  }, {
    // This "data" generates: dist/about/queen/posts/bohemian/rhapsody/footnotes-13/index.html
    authorSlug: 'queen',
    // Note that you can even put slashes here.
    // Plus, in the final path multiple adjacent slashes will be
    // merged into one, so having 'bohemian//rhapsody' would have the same effect.
    postSlug: 'bohemian/rhapsody',
    footnoteNumber: 13,
    content: `He played the beginning on the piano, then stopped and said, \
'And this is where the opera section comes in!' Then we went out to eat dinner.`
  }]
}

export default ({ data: { authorSlug, postSlug, footnoteNumber, content }, index }) => <>
  The index of this data object in the dataList array is {index}.
  In {authorSlug}'s post called {postSlug},
  footnote number {footnoteNumber} refers to: {content}
</>
```

### Components
A component can be any Preact component as you might have guessed.
The thing is that you can't really use `styled-jsx` or a similar library,
because they are bloaty or don't work in a purely SSR enviroment
(if you find anything that works, please [open an issue](https://github.com/trustedtomato/decharge/issues)), so decharge
provides a way to add styles and client-side scripts
(preferably just for progressive enhancement) to a component.
Firstly, you have to make the component:

```tsx
// src/components/MyComplexComponent.tsx

import { createComplexComponent, css } from 'decharge'

interface Props {}

export default createComplexComponent<Props>({
  // Required.
  // This should be an ID unique to the component.
  // If you have only one component in one file, which you probably should,
  // using import.meta.url is perfect.
  id: import.meta.url,
  // Required.
  // The "Props" gets extended here with a generated property.
  // The generated property contains a className property,
  // which can be used to target the component for styling + scripting.
  // The generated className is unique to the component,
  // NOT to the component instance!
  Component: ({ generated }) => <div className={generated.className}>
    I am red and if you click me, I will make an alert.
  </div>,
  // Optional, defaults to false.
  // If it is true, a property called ownDirPath
  // gets added to the "generated" variable mentioned above.
  // ownDirPath is the absolute path of the directory where
  // the component's files can be stored.
  // This path stays the same even if the component
  // is used by different routes.
  generateOwnDir: false,
  // Optional.
  // ".this" will be replaced with the generated className.
  style: css`
    .this {
      color: red;
    }
  `,
  // Optional.
  // Using script is very quirky.
  // 1. Try to use legacy syntax if possible, the user of the component
  // might want to target older browsers and transpiling modern code sometimes
  // results in a big chunk of unnecessary code.
  // 2. Using the method syntax (script () {}) would result in
  // erroneous code, see https://github.com/trustedtomato/decharge/issues/6
  // 3. This function will be executed in a different context,
  // so don't reference any variable which you declared earlier in this file.
  script: function (generatedClassName) {
    var els = document.querySelectorAll('.' + generatedClassName)
    for (var i = els.length - 1, el; el = els[i]; i--) {
      el.onclick = function () {
        alert('Bonjour!')
      }
    }
  }
})
```

Secondly, you have to place some special elements into your route:

```tsx
// src/routes/foo.tsx

import { Scripts, Styles } from 'decharge'
import MyComplexComponent from '../components/MyComplexComponent.js'

export default () => <html>
  <head>
    <Styles />
  </head>
  <body>
    <MyComplexComponent />
    <Scripts type="end-of-body" />
  </body>
</html>
```

See <https://github.com/vercel/styled-jsx/#syntax-highlighting> for CSS syntax highlighting.

#### Async components
You can't simply use a `(params) => Promise<JSX.Element>` instead of a `(params) => JSX.Element`,
so this route's code is invalid:

```tsx
// INVALID ROUTE!

import fetch from 'node-fetch'

const AsyncComponent = async ({ url }) => <div>
  The length of {url}'s source code is {
    await fetch(url)
      .then(res => res.text())
      .then(text => text.length)
  }
</div>

export default () => <>
  <AsyncComponent url="https://google.com" />
</>
```

To fix this issue, there is a built-in function in decharge called `createAsyncComponent`.

```tsx
// Valid route.

import fetch from 'node-fetch'
import { createAsyncComponent } from 'decharge'

const AsyncComponent = createAsyncComponent(async ({ url }) => {
  const length = await fetch(url)
    .then(res => res.text())
    .then(text => text.length)
  return () => {
    // You can use [hooks](#docs-hooks) here.
    return <div>
      The length of {url}'s source code is {length}
    </div>
  }
})

export default () => <>
  <AsyncComponent url="https://google.com" />
</>
```

### Hooks
decharge provides hooks which play nicely with decharge's SSR.
*DO NOT use any other hook (like Preact's), only import hooks from the decharge package!*
See [available hooks in the source code](https://github.com/trustedtomato/decharge/blob/master/packages/decharge/src/runtime/hooks/index.ts), they are pretty well documented there.

### Configuration
Place a file called `decharge.config.js` in your project root.
The config object should be export defaulted, like this:
```tsx
/** @type {import('decharge').UserConfig} */
const config = {
  generatedClassNamePrefix: 'd-',
  distDir: 'dist'
}

export default config
```

See the [configuration options in the source code](https://github.com/trustedtomato/decharge/blob/master/packages/decharge/src/common/Config.ts).

### Built-in components
There are some components which are very commonly needed, these are built-in.
Each component must be imported separately, e.g. `import Image from 'decharge/components/Image'`.
If you feel like a crucial component is missing, [open an issue](https://github.com/trustedtomato/decharge/issues).
See the [source code of the built-in components](https://github.com/trustedtomato/decharge/blob/master/packages/decharge/src/runtime/components) for usage details, they are nicely documented.
