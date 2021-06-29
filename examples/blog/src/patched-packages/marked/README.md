I had to create this patch due to this issue: https://github.com/markedjs/marked/issues/458.
This patch should be replaced with the original marked package once the issue is resolved.

Note that I had to convert the marked package to use the ES module syntax because vite had problems with using a local CommonJS module.
This issue's resolution might be relevant to this: https://github.com/markedjs/marked/issues/1694