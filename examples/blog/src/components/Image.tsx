import gm from 'gm'
import fs from 'fs/promises'
import { constants as fsConstants } from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import parsePath from '../utils/parse-path.js'
import { getGmSize, gmToBuffer } from '../utils/gm-promisified.js'
import createBlurredImageAuto from '../utils/create-blurred-image/auto.js'
import type { JSX } from 'preact/jsx-runtime'
import { createAsyncComponent, createComplexComponent } from 'decharge'
import { useConst } from 'decharge/hooks'
interface Props {
  src: string
  alt: string
  title?: string
  widthConditions?: ([string, { maxWidth?: string, maxHeight?: string }] | [string])[]
  widthVersions?: number[]
}

const maxHeight = 100

export default createComplexComponent<Props>({
  id: import.meta.url,
  Component: createAsyncComponent(async ({
    src,
    alt,
    title,
    generatedClassName,
    widthConditions,
    widthVersions = [375, 720, 800, 900, 1366, 1600, 1920, 4100]
  }): Promise<JSX.Element> => {
    if (!src.startsWith('/')) {
      throw new Error('Only local images are supported, Image src should begin with a / (a slash).')
    }

    const srcToPath = (src: string) => path.join('./public/', src)
    const srcToUrl = (src: string) => path.join('/', src)

    const imageBuffer = await fs.readFile(srcToPath(src))
    const { width, height } = await getGmSize(gm(imageBuffer))
    const downscaledWidths = widthVersions.filter(possibleDownscaledWidth =>
      possibleDownscaledWidth < width && possibleDownscaledWidth * (height / width) < maxHeight
    )
    const parsedSrc = parsePath(src)
    const srcMap = new Map(downscaledWidths.map(downscaledWidth => [
      `${path.join(
        '/generated/',
        parsedSrc.directoryPath
      )}${parsedSrc.name}-${downscaledWidth}${parsedSrc.extension}`,
      downscaledWidth
    ]))

    // Ensure downscaled image files exist.
    for (const [downscaledSrc, downscaledWidth] of srcMap) {
      const downscaledPath = srcToPath(downscaledSrc)
      try {
        // Error if the file doesn't exist.
        await fs.access(downscaledPath, fsConstants.F_OK)
      } catch (err) {
        // Create the downscaled image file.
        const downscaledImageBuffer = await gmToBuffer(
          gm(imageBuffer).resize(downscaledWidth, maxHeight)
        )
        await mkdirp(path.dirname(downscaledPath))
        await fs.writeFile(
          downscaledPath,
          downscaledImageBuffer
        )
      }
    }
    const srcset = `${Array.from(
      srcMap,
      ([downscaledSrc, downscaledWidth]) => `${srcToUrl(downscaledSrc)} ${downscaledWidth}w`
    ).join(',')},${srcToUrl(src)} ${width}w`

    const sizes = widthConditions && widthConditions
      .map(([width, { maxWidth = undefined, maxHeight = undefined } = {}]) => {
        const conditions = []
        if (maxWidth) conditions.push(`(max-width: ${maxWidth})`)
        if (maxHeight) conditions.push(`(max-height: ${maxHeight})`)
        return (
          conditions.length === 0
            ? width
            : conditions.length === 1
              ? `${conditions[0]} ${width}`
              : `(${conditions.join(' and ')}) ${width}`
        )
      })
      .join(',')

    return <div class={`image ${generatedClassName}`} style={`max-width:${width}px`}>
      <div dangerouslySetInnerHTML={{ __html: await createBlurredImageAuto(imageBuffer, 40) }} />
      <img
        src={srcToUrl(src)}
        alt={alt}
        title={title}
        srcset={srcset}
        sizes={sizes}
        loading="lazy"
      />
    </div>
  }),
  /* eslint-disable */
  script: function (className: string) {
    function initImage (img: HTMLImageElement) {
      img.style.opacity = '0'
      img.onload = function () {
        img.style.transition = 'opacity .5s ease-out'
        img.style.opacity = '1'
      }
      if (img.complete) {
        // @ts-ignore
        img.onload()
      }
    }

    var images = document.querySelectorAll(`.${className} img`)
    for (var i = 0; i < images.length; i++) {
      initImage(images[i] as HTMLImageElement)
    }
  }
  /* eslint-enable */
})
