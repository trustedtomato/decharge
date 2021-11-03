const projectNameRegex = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
const projectDescriptionRegex = /^[^"\\<>{}]+/i

export default {
  templatePlaceholders: [
    {
      name: 'projectName',
      fileMatchers: ['*.tsx', '*.json'],
      promptsConfig: {
        type: 'text',
        message: 'Project name',
        validate: (projectName) =>
          projectNameRegex.test(projectName)
            ? true
            : `The project name must match the regex ${projectNameRegex}`
      }
    }, {
      name: 'projectDescription',
      fileMatchers: ['*.tsx', '*.json'],
      promptsConfig: {
        type: 'text',
        message: 'Project description',
        validate: (projectDescription) =>
          projectDescriptionRegex.test(projectDescription)
            ? true
            : 'The project description shall not include the following characters: ^"\\<>{}'
      }
    }
  ]
}
