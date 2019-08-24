# Prettier-modify

`prettier-modify` is a CLI and JS library that allows to define modifier functions that will modify the AST additionally to prettier formatting job.

In order to benefit from `prettier-modify`, you need to define modifiers in a `.prettierrc.js` file like the following:

```js
module.exports = {
  modifiers: {
    css: {
      options: { singleQuote: false }, // This will override prettier options or overrides
      mutate: node => {
        if (node.type === 'css-rule') {
          node.nodes = node.nodes
            // This will remove duplicates
            .reduceRight((acc, v) => {
              if (!acc.some(x => x.prop === v.prop)) acc.push(v)
              return acc
            }, [])
            // This will sort properties alphabetically
            .sort((a, b) => (a.prop > b.prop ? 1 : -1))
        }
      },
    },
  },
}
```

Then you can use it like this:

```bash
npm i prettier-modify
prettier-modify input.css
```

NOTE: `prettier-modify` was tested on html, css, js, yaml, markdown, vue.

NOTE: Each mutate function is slightly different and depends on prettier's AST parsers. See [test/.prettierrc.js](test/.prettierrc.js) file for some advanced examples.

NOTE: `prettier-modify` is a simple CLI so it won't display prettier's original CLI warnings and only allows file input. On the other hand it boots in 100ms versus 1s for prettier's cli.
