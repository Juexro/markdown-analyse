# markdown2html

[![](https://img.shields.io/npm/v/@juexro/markdown2html.svg)](https://www.npmjs.com/package/@juexro/markdown2html)

[![](https://img.shields.io/npm/dm/@juexro/@juexro/markdown2html.svg)](https://www.npmjs.com/package/@juexro/markdown2html)

Depend on [markdown-it](https://www.npmjs.com/package/markdown-it)、 [highlight.js](https://www.npmjs.com/package/highlight.js), analyse markdown to html for nodejs.

## install

```
yarn add @juexro/markdown2html -D
```

## usage

```js
const fs = require('fs')
const MarkdownAnalyse = require('@juexro/markdown2html')
const minify = require('html-minifier').minify
new MarkdownAnalyse({
  cleanDir: true,
  filePath: ['markdown/foo.md', 'markdown/bar'],
  outputPath: 'html',
  beforeOutput ({content, meta, outputFilePath} = {}, md) {
    return minify(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
        ${fs.readFileSync('node_modules/highlight.js/styles/github.css')}
        </style>
      </head>
      <body>
        ${md.render(content)}
      </body>
      </html>`, {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true
      })
  }
}).run()
```

<h2 align="left">options</h2>

| Name | Type | Description |
|---------|--------|-------------|
| cleanDir     | Boolean | remove outputPath directory at first |
| filePath     | Array|String | file path or directory |
| outputPath   | String | output directory |
| beforeOutput | Function | `@param {*} [{outputFilePath, meta, content}={}, md]`, you can use `md.render` to render your markdown template.
