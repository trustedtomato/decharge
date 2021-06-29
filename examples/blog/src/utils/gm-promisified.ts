import type { State as Gm } from 'gm'

export function getGmSize (gm: Gm): Promise<{width: number, height: number }> {
  return new Promise((resolve, reject) => {
    gm.size((err, value) => {
      if (err) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })
}

export function gmToBuffer (gm: Gm): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    gm.toBuffer((err, value) => {
      if (err) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })
}

export function getGmFormat (gm: Gm): Promise<string> {
  return new Promise((resolve, reject) => {
    gm.format((err, value) => {
      if (err) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })
}

export function gmWrite (targetPath: string, gm: Gm): Promise<void> {
  return new Promise((resolve, reject) => {
    gm.write(targetPath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}


