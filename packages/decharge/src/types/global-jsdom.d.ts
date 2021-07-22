// This is a reduced version of it global-jsdom's API!
declare module 'global-jsdom' {
  /**
   * Adds JSDOM globals to the global object.
   * Returns a cleanup function which removes the added properties.
   */
  export default function (defaultHtml: string, options?: { url?: string }): () => void
}
