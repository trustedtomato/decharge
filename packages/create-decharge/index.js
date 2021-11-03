#!/usr/bin/env node

import pathLib from 'path'
import fs from 'fs-extra'
import { sentenceCase } from 'sentence-case'
import { globby } from 'globby'
import minimatch from 'minimatch'
import { chdirTemp } from './utils/chdir-temp.js'
import { prompt } from './utils/prompt.js'
import { fatalError } from './utils/fatal-error.js'

// Error if directory is empty.
const isDirectoryEmpty = (await fs.readdir('.')).length === 0
if (!isDirectoryEmpty) {
  fatalError('The directory in which you initalise the project should be empty, aborting.')
}

const createDechargeMetadata = await fs.readJSON(new URL('./package.json', import.meta.url), 'utf8')

const templates = await fs.readdir(new URL('./templates', import.meta.url))

const { template } = await prompt({
  type: 'select',
  name: 'template',
  message: 'Pick a template',
  choices: templates.map(template => ({
    title: sentenceCase(template),
    value: template
  }))
})

const templateDirUrl = new URL(
  `./templates/${template}/`,
  import.meta.url
)
const templateSettingsUrl = new URL(
  `./template-settings.js`,
  templateDirUrl
)
const { default: { templatePlaceholders } } = await import(templateSettingsUrl)
const templatePlaceholderReplacements = new Map()

// Get templatePlaceholder replacement values which require prompt.
const answers = await prompt(
  templatePlaceholders
    .filter(({ promptsConfig }) => promptsConfig)
    .map(
      ({ promptsConfig }, index) => ({
        ...promptsConfig,
        name: index
      })
    )
)

for (const [index, answer] of Object.entries(answers)) {
  templatePlaceholderReplacements.set(
    templatePlaceholders[index],
    answer
  )
}

// Copy template to current directory
// while applying the required changes. 
const templateFiles = await chdirTemp(templateDirUrl.pathname, async () =>
  await globby([
    '**/*',
    '!template-settings.js'
  ], {
    gitignore: true,
    dot: true
  })
).then(paths =>
  paths.map(path => ({
    path,
    fullPath: pathLib.join(templateDirUrl.pathname, path)
  }))
)

for (const { path, fullPath } of templateFiles) {
  let modifiedContent = null
  const modifyContent = async (transform) => {
    if (modifiedContent === null) {
      modifiedContent = await fs.readFile(fullPath, 'utf8')
    }
    modifiedContent = transform(modifiedContent)
  }

  // Modify content.
  for (const templatePlaceholder of templatePlaceholders) {
    if (templatePlaceholder.fileMatchers.some(
      matcher => minimatch(path, matcher, { matchBase: true })
    )) {
      await modifyContent(content =>
        content.replaceAll(
          `TEMPLATE_PLACEHOLDER(${templatePlaceholder.name})`,
          templatePlaceholderReplacements.get(templatePlaceholder)
        )
      )
    }
  }
  if (path === 'package.json') {
    await modifyContent((rawContent) => {
      const content = JSON.parse(rawContent)
      for (const [name, version] of Object.entries(content.dependencies)) {
        if (version === 'workspace:*') {
          content.dependencies[name] = createDechargeMetadata.dependencies[name]
        }
      }
      return JSON.stringify(content, null, 2)
    })
  }

  // Finalize content.
  if (modifiedContent === null) {
    await fs.copy(fullPath, path)
  } else {
    await fs.outputFile(path, modifiedContent)
  }
}
