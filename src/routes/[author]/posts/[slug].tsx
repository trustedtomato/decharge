interface Props {
  author: string
  slug: string
}

export const propsList: Iterable<Props> = [
  { author: 'bob-dylan', slug: 'like-a-rolling-stone' },
  { author: 'avicii', slug: 'wake-me-up' },
  { author: 'kakicii', slug: 'hey-brother' }
]

export default ({ author, slug }: Props) => <>
  <div>
    The author is {author} and its slug is {slug}.
  </div>
</>