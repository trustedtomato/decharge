import { createComplexComponent, css } from './create-complex-component.js'
import { renderPage, Scripts, Styles } from '../index.js'
import { test } from 'protester'
import type { ComponentChildren } from 'preact'

test('`css` function works as expected', assert => {
  assert.equal(css`body{color:red;}`, 'body{color:red;}')
  assert.equal(css`body{color:${'r' + 'ed'};}`, 'body{color:red;}')
})

const script = function (x: string) {
  console.log(x)
}

const MyComplexComponent = createComplexComponent<{
  children: ComponentChildren
}>({
  id: import.meta.url,
  Component: ({ generated, children }) => <div className={generated.className}>{children}</div>,
  style: css`.this{color:red;}}`,
  script
})

test('Scripts and Styles are not injected when there is no complexComponent', async assert => {
  assert.expectedAssertionCount = 1

  const result = await renderPage(() => <>
    <Styles />
    <body>
      <Scripts type='end-of-body' />
    </body>
  </>)
  assert.equal(result, '<body></body>')
})

test('correct Scripts and Styles are injected when there is a complexComponent', async assert => {
  assert.expectedAssertionCount = 1

  const result = await renderPage(() => <>
    <Styles />
    <MyComplexComponent>child</MyComplexComponent>
    <Scripts type='end-of-body' />
  </>)
  assert.equal(result, `<style>.d-a{color:red;}</style><div class="d-a">child</div><script>(${script.toString()})("d-a");</script>`)
})

test('only one script and style is injected per component', async assert => {
  assert.expectedAssertionCount = 1

  const result = await renderPage(() => <>
    <Styles />
    <MyComplexComponent>child</MyComplexComponent>
    <MyComplexComponent>child</MyComplexComponent>
    <Scripts type='end-of-body' />
  </>)
  assert.equal(result, `<style>.d-a{color:red;}</style><div class="d-a">child</div><div class="d-a">child</div><script>(${script.toString()})("d-a");</script>`)
})

test('createComplexComponent throws an error when script is method syntaxed', assert => {
  assert.throw(() => {
    createComplexComponent({
      id: 'foo',
      Component: () => <>foo</>,
      script () {
        console.log('🤮')
      }
    })
  })
})
