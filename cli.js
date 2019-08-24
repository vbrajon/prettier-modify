#!/usr/bin/env node
const prettier = require('prettier')
const { format } = require('./prettier-modify.js')

process.argv.slice(2).map(async filepath => {
  try {
    const ext = filepath.split('.').slice(-1)[0]
    const options = await prettier.resolveConfig(filepath)
    const modifier = (options.modifiers || {})[ext] || {}
    const input = require('fs').readFileSync(filepath, 'utf8')
    const output = await format(input, { ext, options, ...modifier.options }, modifier)
    console.log(output)
    // require('fs').writeFileSync(filepath, output, 'utf8')
    // console.log('success', filepath)
  } catch (e) {
    console.error('error', filepath, e)
  }
})
