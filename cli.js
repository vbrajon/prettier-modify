#!/usr/bin/env node
const prettier = require('prettier')
const { format } = require('./prettier-modify.js')

const options = process.argv.slice(2).filter(d => /^-/.test(d))
const files = process.argv.slice(2).filter(d => !/^-/.test(d))
files.map(async filepath => {
  try {
    const ext = filepath.split('.').slice(-1)[0]
    const input = require('fs').readFileSync(filepath, 'utf8')
    const output = await format(input, { ext })
    if (options.filter(o => ['-i', '--inline'].includes(o)).length) require('fs').writeFileSync(filepath, output, 'utf8')
    else console.log(output)
    if (options.filter(o => ['-v', '--verbose'].includes(o)).length) console.info('success', filepath)
  } catch (e) {
    console.error('error', filepath, e.message)
  }
})
