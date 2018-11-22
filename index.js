const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const hljs = require('highlight.js')
const plugin = require('@juexro/markdown-it-highlight-code-block')

class MarkdownAnalyse {
  constructor ({filePath, outputPath = 'dist', beforeOutput, cleanDir = false} = {}) {
    this.keysReg = /\S+:.+\r/gm
    this.metaReg = /---(([\s\S])*?)---/s
    this.md = new MarkdownIt({
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre><ol>${str.split('\n').map((item) => {
              return item ? `<li><code class="hljs">${hljs.highlightAuto(item).value}</code></li>` : ''
            }).join('')}</ol></pre>`
          } catch (__) {}
        }
        return ''
      }
    }).use(plugin)
    this.filePath = filePath
    this.outputPath = path.resolve(outputPath)
    this.beforeOutput = beforeOutput
    this.cleanDir = cleanDir
  }
  run () {
    if (this.cleanDir && path.resolve() === this.outputPath) {
      throw new Error('This action will clean your root directory.Please change outputPath or cleanDir.')
    }
    if (fs.existsSync(this.outputPath)) {
      if (this.cleanDir) {
        this.removeDir(this.outputPath)
        fs.mkdirSync(this.outputPath, { recursive: true })
      }
    } else {
      fs.mkdirSync(this.outputPath, { recursive: true })
    }

    if (this.filePath) {
      if (Array.isArray(this.filePath)) {
        this.filePath.forEach((path) => {
          this.analyseFile(path)
        })
      } else {
        this.analyseFile(this.filePath)
      }
    }
  }
  getHeaderMeta (content) {
    const meta = content.match(this.metaReg)
    const keys = meta && meta[0].match(this.keysReg)
  
    let obj = {}
    keys && keys.forEach(key => {
      const index = key.indexOf(':')
      obj[key.slice(0, index)] = key.slice(index + 1).trim().replace('\r', '')
    })
    return obj
  }
  output ({outputFilePath, meta, content} = {}) {
    let body =  content.replace(this.metaReg, '')
    if (this.beforeOutput) {
      body = this.beforeOutput({
        outputFilePath,
        meta,
        content
      }, this.md)
      fs.writeFileSync(outputFilePath, body)
    } else {
      body = fs.writeFileSync(outputFilePath, this.md.render(body))
    }
    return body
  }
  readFile (path) {
    return fs.readFileSync(path, 'utf8')
  }
  analyseFile (filePath) {
    const stat = fs.statSync(filePath)
    if (stat.isFile()) {
      const file = this.readFile(filePath)
      const meta = this.getHeaderMeta(file)
      const outputFilePath = this.getOutputFilePath(filePath)
      this.output({
        type: 'file',
        outputFilePath,
        meta,
        content: file
      })
    } else if (stat.isDirectory()) {
      const files = fs.readdirSync(filePath)
      files.forEach((file) => {
        const newPath = path.join(filePath, file)
        this.analyseFile(newPath)
      })
    }
  }
  getOutputFilePath (name) {
    const fileName = name.split('/').pop()
    return path.join(this.outputPath, fileName.replace(/\.[^.]*$/, '.html'))
  }
  removeDir (dir) {
    const stat = fs.statSync(dir)
    if (stat.isFile()) {
      fs.unlinkSync(dir)
    } else if (stat.isDirectory()) {
      const files = fs.readdirSync(dir)
      files.forEach(file => {
        fs.unlinkSync(path.join(dir, file))
      })
      fs.rmdirSync(dir)
    }
  }
}

module.exports = MarkdownAnalyse