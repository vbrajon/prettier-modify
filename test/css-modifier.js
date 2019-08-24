module.exports = {
  options: { singleQuote: false },
  mutate: node => {
    if (node.type === 'css-rule') {
      node.nodes = node.nodes
        .reduceRight((acc, v) => {
          if (!acc.some(x => x.prop === v.prop)) acc.push(v)
          return acc
        }, [])
        .sort((a, b) => (a.prop > b.prop ? 1 : -1))
    }
  },
}
