import type { JSX } from 'preact/jsx-runtime'

interface Props {
  basedOn: Element
}

function walkDomTree (el: Element, func: (el: Element) => void) {
  func(el)
  Array.from(el.children, child => {
    if (child) {
      walkDomTree(child, func)
    }
    return undefined
  })
}

interface ListOfContentsItem {
  level: number
  text: string
}

type ListOfContents = ListOfContentsItem[]

class ContentNode {
  children: ContentNode[] = []
  parent: ContentNode | null = null
  get level (): number {
    let level = 0
    let currentParent = this.parent
    while (true) {
      if (currentParent === null) {
        break
      }
      currentParent = currentParent.parent
      level++
    }
    return level
  }

  constructor (readonly text: string | null = null) {}

  pushChild (child: ContentNode) {
    child.parent = this
    this.children.push(child)
  }
}

function parseListOfContents (listOfContents: ListOfContents): ContentNode[] {
  const root = new ContentNode('root-node')
  let currentParent = root
  for (const { level, text } of listOfContents) {
    while (currentParent.level > level - 1) {
      currentParent = currentParent.parent
    }
    if (currentParent.level === level - 3) {
      throw new Error('There can\'t be a skipped heading!')
    }
    if (currentParent.level === level - 2) {
      currentParent = currentParent.children[currentParent.children.length - 1]
      if (!currentParent) {
        throw new Error('undefined currentParent!')
      }
    }
    if (currentParent.level === level - 1) {
      currentParent.pushChild(new ContentNode(text))
    }
  }
  return root.children
}

function generateListElement (contentArray: ContentNode[]) {
  return <ul> {
    contentArray.map(({ text, children }) =>
      <li key={text}>
        { text }
        {
          children.length === 0
            ? null
            : generateListElement(children)
        }
      </li>
    )
  } </ul>
}

export default ({ basedOn }: Props): JSX.Element => {
  if (!basedOn) {
    return null
  }

  const listOfContents: ListOfContents = []
  walkDomTree(basedOn, (el) => {
    const headingMatch = el.nodeName.match(/H([1-9])/)
    if (headingMatch) {
      listOfContents.push({
        level: Number(headingMatch[1]),
        text: el.textContent.trim()
      })
    }
  })

  const contentArray = parseListOfContents(
    listOfContents
      .map(content => ({
        ...content,
        level: content.level - (listOfContents[0].level - 1)
      }))
  )

  return <div>{generateListElement(contentArray)}</div>
}
