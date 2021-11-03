import prompts from 'prompts'
import { fatalError } from './fatal-error.js'

export async function prompt (config) {
  return await prompts(config, {
    onCancel () {
      fatalError('Canceled prompt, aborting.')
    }
  })
}
