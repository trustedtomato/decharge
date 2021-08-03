import fs from 'fs/promises'
import { constants as fsConstants } from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import sharp from 'sharp'
import { createPlaceholderSvg } from '../utils/create-placeholder-svg/auto.js'
import { createAsyncComponent, createComplexComponent } from '../index.js'

interface Props {
  src: string
  alt: string
  title?: string
  widthConditions?: ([string, { maxWidth?: string, maxHeight?: string }] | [string])[]
  widthVersions?: number[]
  maxHeight?: number
}

export default createComplexComponent<Props>({
  id: import.meta.url,
  generateOwnDir: true,
  Component: createAsyncComponent(async ({
    src,
    alt,
    title,
    generated,
    widthConditions,
    widthVersions = [375, 720, 800, 900, 1366, 1600, 1920, 4100],
    maxHeight = 1000
  }) => {
    if (!src.startsWith('/')) {
      throw new Error('Only local images are supported, <Image/> src should begin with a / (a slash).')
    }

    const urlToPath = (url: string) => path.join(
      process.cwd(),
      'dist',
      url.replaceAll('/', path.sep)
    )

    const pathToUrl = (_path: string) => '/' + path.relative(
      path.join(process.cwd(), 'dist'),
      _path
    ).replaceAll(path.sep, '/')

    const srcPath = urlToPath(src)

    const imageBuffer = await fs.readFile(srcPath)
    const imageBufferSharp = sharp(imageBuffer)
    const { width, height } = await imageBufferSharp.metadata()

    if (!width || !height) {
      throw new Error('sharp cannot get the correct width/height of the image!')
    }

    const downscaledWidths = widthVersions.filter(possibleDownscaledWidth =>
      possibleDownscaledWidth < width && possibleDownscaledWidth * (height / width) < maxHeight
    )
    const parsedSrc = path.parse(src)
    const pathMap = new Map(downscaledWidths.map(downscaledWidth => [
      path.join(
        generated.ownDirPath!!,
        parsedSrc.dir,
        `${parsedSrc.name}-${downscaledWidth}${parsedSrc.ext}`
      ),
      downscaledWidth
    ]))

    // Ensure downscaled image files exist.
    for (const [downscaledPath, downscaledWidth] of pathMap) {
      try {
        // Error if the file doesn't exist.
        await fs.access(downscaledPath, fsConstants.F_OK)
      } catch (err) {
        // Create the downscaled image file.
        const downscaledImageBuffer = await imageBufferSharp
          .resize({
            width: downscaledWidth
          })
          .toBuffer()
        await mkdirp(path.dirname(downscaledPath))
        await fs.writeFile(
          downscaledPath,
          downscaledImageBuffer
        )
      }
    }
    const srcset = `${Array.from(
      pathMap,
      ([downscaledPath, downscaledWidth]) => `${pathToUrl(downscaledPath)} ${downscaledWidth}w`
    ).join(',')},${src} ${width}w`

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

    const placeholderSvg = await createPlaceholderSvg(imageBuffer, 40)

    return () => <div class={`image ${generated.className}`} style={`max-width:${width}px`}>
      <div dangerouslySetInnerHTML={{ __html: placeholderSvg }} />
      <img
        src={src}
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
