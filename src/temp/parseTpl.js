console.log(html`
  text
  <h1>title</h1>
  <ul onclick=${console.log} attr="value" checked>
    ${[1, 2, 3].map((n) => n)}
    <!-- comment -->
  </ul>
`)

/**
 * @param {TemplateStringsArray} strings
 * @param {unknown[]} values
 */
function html(strings, ...values) {
  const reg =
    //<el        |     | attr                                  | > | </el>   | <!--       --> |text
    /(<[^\s!/>]+)|(\s+)|([^\s</>=]+(=(?:"[^"]*"|'[^']*'|\S+))?)|(>)|(<\/.*?>)|(<!--[.\s]*?-->)|.+/g

  /**@type {*[]} */
  const nodes = []
  let current = ''

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i]
    const value = values[i]

    let m
    while ((m = reg.exec(string))) {
      const [
        token,
        openTagStart,
        space,
        attr,
        openTagEnd,
        closeTag,
        comment,
        text,
      ] = m
      console.log('token:', token)

      if (text) {
        console.log('[text]', text)
        nodes.push(text)
      }

      if (current == 'text') {
        if (openTagStart) {
          current = 'openTagStart'
          nodes.push({
            type: openTagStart.slice(1),
          })
        }
      }
    }

    console.log('value:', values[i])
  }

  console.log(nodes)
  return nodes
}
