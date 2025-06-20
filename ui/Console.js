import { Custom, html, css } from './Custom.js'

export class Console extends Custom {
  render() {
    return html`
      <console>
        <key f12></key>
        <main>
          <nav>
            <b>clear</b>
            <b>location</b>
            <b>document</b>
            <b>storage</b>
            <b>window</b>
            <b>screen</b>
            <b>navigator</b>
            <b>history</b>
            <b>performance</b>
            <b>dir($0)</b>
          </nav>
          <ul>
            <li>
              <div map>
                <div key-value>
                  <span key> </span>
                  <span value> </span>
                  <div map></div>
                </div>
              </div>
            </li>
          </ul>
          <textarea placeholder="$" required></textarea>
          <button run>run</button>

          <div>
            <ul>
              <li></li>
            </ul>
          </div>
        </main>
      </console>
      <style>
        head {
          display: block;
        }
        console,
        box {
          box-sizing: border-box;
          display: block;
          font-size: 12px;
          font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
          line-height: 1.5;
          color: #333;
          text-align: left;
          cursor: default;
          -webkit-user-select: text;
          user-select: text;
          transition: 0.3s, opacity 0.6s;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          -webkit-overflow-scrolling: touch;
          -webkit-text-size-adjust: none;
        }
        console *,
        box * {
          box-sizing: inherit;
          font: inherit;
          color: inherit;
          text-decoration: none;
          outline: none;
          transition: inherit;
        }

        console {
          position: fixed;
          z-index: 999999995;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 1080px;
          height: 322px;
          height: 375px;
          min-height: 25px;
          margin: auto auto 0;
          text-shadow: 0px 1px 1px #fff;
          transition: 0.3s cubic-bezier(0, 0, 0.25, 1) transform;
          transform: translate(0, 100%);
        }
        console[open] {
          max-height: calc(100vh - 30px);
          transition: 0.3s cubic-bezier(0.25, 0, 1, 1) transform;
          transform: translate(0, 0);
          box-shadow: rgba(125, 125, 125, 0.3) 0px 0 15px 0;
        }
        console[hidden] {
          display: none;
        }
        console main {
          transition: 0.3s;
          position: relative;
          overflow: hidden;
          height: 100%;
        }
        console [f12] {
          position: absolute;
          bottom: 100%;
          right: 1em;
          width: 2.82em;
          padding: 3px 6px 0;
          border: solid 1px #eee;
          border-bottom: 0;
          border-radius: 8px 8px 0 0;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 4px -4px 10px -4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        console [f12]:after {
          content: 'F12';
        }
        console[open] [f12]:after {
          content: '↑↓';
        }
        console nav {
          display: flex;
          position: absolute;
          z-index: 9;
          top: 0;
          left: 0;
          right: 0;
          white-space: nowrap;
          overflow: auto;
          touch-action: pan-x;
          border-top: solid 1px rgba(255, 255, 255, 0.2);
          border-bottom: solid 1px rgba(200, 200, 200, 0.2);
          background: rgba(250, 250, 250, 0.8);
          -webkit-backdrop-filter: blur(1.5px);
          backdrop-filter: blur(1.5px);
        }
        console nav > * {
          padding: 0.25em 0.5em;
        }

        console ul {
          height: 100%;
          padding: 26px 0 4em;
          margin: 0;
          overflow: auto;
          overscroll-behavior: contain;
          list-style: none;
          background: rgba(255, 255, 255, 0.95);
        }
        console li {
        }
        console li > [map] {
          display: flex;
          align-items: start;
          padding: 0.25em;
          border-top: solid 1px rgba(255, 255, 255, 0.4);
          border-bottom: solid 1px rgba(200, 200, 200, 0.2);
          overflow: auto;
          white-space: nowrap;
        }
        console li > [map] > [key-value] {
          display: inline-block;
          vertical-align: top;
          padding: 0 0.5em;
        }
        console li > [map] > [key-value]:nth-last-child(2) {
          flex: 1;
        }

        console [ajax] {
          background: rgba(125, 255, 159, 0.1);
          color: #bbb;
        }
        console [log] {
          background: rgba(250, 250, 255, 0.1);
        }
        console [info] {
          background: rgba(125, 200, 255, 0.1);
          color: #0095ff;
        }
        console [warn] {
          background: rgba(255, 225, 125, 0.1);
          color: #ff6f00;
        }
        console [error] {
          background: rgba(255, 125, 125, 0.1);
          color: red;
        }
        console [success] {
          color: #00cc8a;
        }

        console [cmd] {
          position: relative;
          background: rgba(125, 243, 255, 0.1);
          color: #0af;
        }
        console [cmd] [key]:before {
          content: '$ ';
          position: absolute;
          left: 0;
          color: #ddd;
        }

        console [map] {
        }
        console [key-value] {
          white-space: nowrap;
        }
        console [key] {
          color: #a71d5d;
        }
        console [value] {
        }

        console [value][number] {
          color: #c000ff;
        }
        console [value][string] {
          color: #666;
        }
        console [value][boolean] {
          color: #ff0060;
        }
        console [value][null] {
          color: #ccc;
        }
        console [value][undefined] {
          color: #ccc;
        }
        console [value][function] {
          color: #489ae0;
        }
        console [value][htmldocument] {
          color: #a71d5d;
        }
        console [value][element] {
          color: #a71d5d;
        }

        console li > [map] > [key-value] > [string] {
          color: inherit;
        }
        console [cmd] [value] {
          color: #0af;
        }
        console [trace] > [value] {
          color: #ccc;
        }

        console [htmldocument]:after,
        console [element]:after {
          content: ' ⇿';
          color: #888;
        }
        console [open] > [htmldocument]:after,
        console [open] > [element]:after {
          visibility: hidden;
        }

        console [value] + [map] {
          max-width: 0;
          max-height: 0;
          padding-left: 1em;
          border-left: dotted 1px #ddd;
          overflow: hidden;
          opacity: 0;
          transition: 0.3s cubic-bezier(0, 1, 0, 1), opacity 0.6s;
        }
        console [key-value][open] > [map] {
          max-width: 59999px;
          max-height: 59999px;
          overflow: auto;
          opacity: 1;
          transition: 0.3s cubic-bezier(1, 0, 1, 0), opacity 0.6s;
        }
        console [key-value][open] > [value]:not([element]) {
          xxopacity: 0.5;
        }

        console [key-value][active] > [value] {
          xxcolor: #f0a;
          display: inline-block;
          vertical-align: top;
          max-width: calc(100vw - 2em);
          width: max-content;
          white-space: pre-wrap;
          word-break: break-word;
        }

        console textarea {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          line-height: 1.25;
          display: block;
          width: 100%;
          border: none;
          border-radius: 0;
          outline: none;
          height: 3em;
          padding: 0.25em 1em;
          resize: none;
          background: rgba(255, 255, 255, 0);
          -webkit-backdrop-filter: blur(1.5px);
          backdrop-filter: blur(1.5px);
          color: #333;
        }
        console [run] {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 0.25em 1em;
          border: solid 1px currentColor;
          border-radius: 5px;
          background: #fff;
          color: #0af;
        }
        console textarea:focus {
          height: 8em;
          background: #fff;
          box-shadow: #ddd 0px 0 15px 0;
        }
        console textarea:invalid + [run] {
          opacity: 0;
        }

        console ul + a {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          font-size: 1.5em;
          text-align: center;
          opacity: 0;
        }
        console ul:empty + a {
          opacity: 0.25;
          top: 48px;
        }

        @media all and (min-width: 768px) {
          console ::-webkit-scrollbar {
            width: 6px;
            height: 10px;
          }
          console ::-webkit-scrollbar-thumb {
            border-radius: 9px;
            border: 1px solid transparent;
            box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.1) inset;
          }
        }
        @media all and (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }
        }
        @media all {
          console ul {
            -webkit-overflow-scrolling: touch;
          }
          console ul:before {
            content: '';
            float: left;
            height: calc(100% + 1px);
            width: 1px;
            margin-left: -1px;
          }
        }
        @supports (backdrop-filter: blur(1px)) or
          (-webkit-backdrop-filter: blur(1px)) {
          console ul {
            background: rgba(255, 255, 255, 0.9);
            -webkit-backdrop-filter: blur(5px);
            backdrop-filter: blur(5px);
          }
        }
      </style>
    `
  }
  static {
    customElements.define('w-console', this)
  }
}
