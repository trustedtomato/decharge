export class Config {
  /**
   * The prefix in the class name generated by createComplexComponent.
   */
  generatedClassNamePrefix: string = 'd-'
  /**
   * The directory which contains your routes, components
   * and the files required by these.
   */
  srcDir: string = 'src'
  /**
   * Where your routes lie inside the src directory.
   */
  routesDir: string = 'routes'
  /**
   * The temporary directory generated by decharge's build process.
   */
  tempDir: string = '.decharge'
  /**
   * The final build directory generated by decharge.
   * Both build and watch uses this directory for the output.
   */
  distDir: string = 'dist'
  /**
   * The directory inside dist in which the internally generated files are.
   * For example the <Image/> component creates such files when
   * creating the resized versions of an image.
   */
  distGeneratedDir: string = '.decharge'
  /**
   * The directory where your static files go
   * which should be copied to the dist directory.
   */
  publicDir: string = 'public'
  constructor (options?: Partial<Config>) {
    Object.assign(this, options)
  }
}

export type UserConfig = Partial<Config>
