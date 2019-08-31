#!/usr/bin/env node
const prettier = require('prettier')

async function format(text, { ext }) {
  const config = await prettier.resolveConfig('file.' + ext)
  const modifier = (config.modifiers || {})[ext] || {}
  let { parser, plugin, pre, mutate, post, parse, print, options } = modifier
  options = { ...config, ...options }
  if (!parser) parser = ext
  if (!plugin) plugin = ['parser-babylon', 'parser-graphql', 'parser-html', 'parser-markdown', 'parser-postcss', 'parser-typescript', 'parser-yaml'].find(p => p.includes(parser)) || { babel: 'parser-babylon', json: 'parser-babylon', scss: 'parser-postcss', less: 'parser-postcss', angular: 'parser-html', vue: 'parser-html', jade: 'parser-html' }[parser]
  const wrapper = require(require.resolve('prettier').replace('index', plugin))
  const traverse = (node, level = 0) => {
    if (!node || typeof node.type !== 'string') return
    if (mutate) mutate(node)
    // console.log('  '.repeat(level) + node.type)
    Object.keys(node).map(k => {
      if (Array.isArray(node[k])) return node[k].map(n => traverse(n, level + 1) || n)
      return traverse(node[k], level + 1)
    })
  }

  parse = wrapper.parsers[parser].parse
  wrapper.parsers[parser].parse = (text, parsers, opts) => {
    const ast = parse(text, parsers, Object.assign(opts, options || {}))
    traverse(ast)
    return ast
  }

  if (pre) text = await pre(text)
  text = prettier.format(text, { parser }, options)
  if (post) text = await post(text)

  return text
}

module.exports = { format }
