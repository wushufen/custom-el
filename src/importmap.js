if (typeof document != 'undefined') {
  const script = document.createElement('script')
  script.type = 'importmap'
  script.innerHTML = JSON.stringify({
    imports: {
      htm: 'https://esm.sh/htm/mini?dev',
    },
  })
  document.head.appendChild(script)
}
