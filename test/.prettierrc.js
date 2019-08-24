const cssorder = [
  // Layout
  'z-index',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  // Event
  'cursor',
  'pointer-events',
  'overflow',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  // Display
  'visibility',
  'opacity',
  'display',
  'order',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'align-content',
  'align-items',
  'align-self',
  'justify-content',
  // Box
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'width',
  'height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  // Box
  'color',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-repeat',
  'background-size',
  'border',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'box-shadow',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  // Text
  'font',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-weight',
  'text-align',
  'text-align-last',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-style',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-transform',
  'text-underline-position',
  'letter-spacing',
  'line-break',
  'line-height',
  'white-space',
  'word-break',
  'word-spacing',
  'word-wrap',
  // Transition
  'transition',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'animation',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-timing-function',
].reverse()
const modifiers = {}
modifiers.js = { parser: 'babel' }
modifiers.css = {
  options: { singleQuote: false },
  mutate: node => {
    if (node.type === 'css-rule') {
      node.nodes = node.nodes
        .reduceRight((acc, v) => {
          if (!acc.some(x => x.prop === v.prop)) acc.push(v)
          return acc
        }, [])
        .sort((a, b) => {
          const ia = cssorder.indexOf(a.prop)
          const ib = cssorder.indexOf(b.prop)
          if (ia !== ib) return ia > ib ? -1 : 1
          return a.prop > b.prop ? 1 : -1
        })
    }
  },
  post: text =>
    text.replace(/\{[^}]*\}/g, rule =>
      rule
        .replace(/(\n|  )/g, '')
        .replace(/ !important/g, '!important')
        .replace('{', '{ ')
        .replace('}', ' }'),
    ),
}
modifiers.vue = modifiers.html = {
  mutate: node => {
    if (node.type === 'attribute' && node.name === node.value) node.value = null
    if (node.type === 'element') {
      node.attrs = node.attrs
        .reduceRight((acc, v) => {
          v.name = v.name.replace(/^v-bind/, '').replace(/^v-on:/, '@')
          if (!acc.some(x => x.name === v.name)) acc.push(v)
          return acc
        }, [])
        .sort((a, b) => {
          const i = str =>
            str.replace(/^(:|@|v-)?(.*)/, (_, v, attr) => {
              if (['id', 'is', 'style'].includes(attr)) return String.fromCharCode(0) + ['id', 'is', 'style'].indexOf(attr) + [':', '@', 'v-'].indexOf(v)
              if (['ref'].includes(_)) return String.fromCharCode(10e10)
              return [':', '@', 'v-'].indexOf(v) + attr
            })
          let ia = i(a.name)
          let ib = i(b.name)
          if (ia !== ib) return ia > ib ? 1 : -1
          return a.name > b.name ? 1 : -1
        })
    }
  },
}
function replace_characters(text, dict = { '&quot;': '"', '&amp;': '&', '&frasl;': '/', '&lt;': '<', '&gt;': '>' }) {
  for (key in dict) text = text.replace(new RegExp(key, 'gi'), dict[key])
  return text
}
modifiers.jade = {
  options: { semi: true, printWidth: Infinity },
  parser: 'vue',
  plugin: 'parser-html',
  pre: text => '<template>' + replace_characters(require('pug').render(text.replace(/block\n/g, 'block()\n'))) + '</template>',
  mutate: modifiers.html.mutate,
  post: async text => {
    const html = text.replace(/<template\s*>([^]*)<\/template>/, '$1')
    const jade = await new Promise((resolve, reject) => require('html2jade').convertHtml(html, { bodyless: true, donotencode: true, double: true, noattrcomma: true, noemptypipe: true }, (err, res) => (err ? reject(err) : resolve(res))))
    return jade
  },
}
modifiers.yml = {
  options: { singleQuote: false },
  parser: 'yaml',
  pre: async text => {
    const { format } = require('./p')
    const lines = text.split('\n')
    const indents = lines.map(l => l.match(/^[\s]+/) && l.match(/^[\s]+/)[0].length || 0)
    const changes = await Promise.all(lines
      .map((l, i) => lines.slice(i, indents.slice(i + 1).findIndex((d, j) => lines[j + i + 1] && d <= indents[i]) + i + 1))
      .map(async grp => {
        if (!grp.length || grp.length === 1) return
        const key = (grp[0].match(/^[\s]*(\w+):/) || [])[1] || ''
        const ext = { css: 'css', style: 'css', template: 'jade', mixin: 'js' }[key]
        if (!ext) return
        const indent = grp[1].match(/^[\s]+/)[0].length
        const prev = grp.slice(1).join('\n')
        const next = ext === 'js'
          ? (await format('(' + prev.split('\n').map(l => l.slice(indent)).join('\n') + ')', { ext })).slice(2, -2)
          : (await format(prev.split('\n').map(l => l.slice(indent)).join('\n'), { ext })).slice(0, -1)
        if (/\\\n/.test(next)) return null // console.log + comment
        return [prev, next.split('\n').map(l => ' '.repeat(indent) + l).join('\n')]
      }))
    changes.filter(c => c).map(c => text = text.replace(c[0], c[1]))
    return text
  },
}

module.exports = {
  printWidth: 240,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  htmlWhitespaceSensitivity: 'ignore',
  modifiers,
}
