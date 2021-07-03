const validClassNameFirstChars = 'abcdefghijklmnopqrstuvwxyz'
const maxClassNameFirstCharIndex = validClassNameFirstChars.length - 1
const validClassNameNotFirstChars = `${validClassNameFirstChars}0123456789-_`
const maxClassNameNotFirstCharIndex = validClassNameNotFirstChars.length - 1
const validClassNameChars = validClassNameNotFirstChars

/**
 * Creates an iterator which iterates over valid class names.
 * a, b, ..., y, z, aa, ab, ..., ay, az,
 * a0, a1, ..., a8, a9, a-, a_, ba, bb, ...
 */
export function * makeClassNameIterator (): Generator<string, never, void> {
  const classNameCharIndicies = [0]
  while (true) {
    yield classNameCharIndicies.map(charIndex => validClassNameChars[charIndex]).join('')
    let i = classNameCharIndicies.length - 1
    for (;;i--) {
      if (i === -1) {
        classNameCharIndicies.unshift(0)
        break
      }
      const charIndex = classNameCharIndicies[i]
      if (charIndex < (
        i === 0
          ? maxClassNameFirstCharIndex
          : maxClassNameNotFirstCharIndex
      )) {
        classNameCharIndicies[i] += 1
        break
      }
    }
    classNameCharIndicies.fill(0, i + 1)
  }
}
