import React from 'react';
import { injectIntl } from 'react-intl'
import MEditor from '@s524797336/m-editor'
import MEditorCatalogProvider from '@s524797336/m-editor/dist/CatalogProvider'
import Strong from '@s524797336/m-editor-strong-decorator-plugin'
import Italic from '@s524797336/m-editor-italic-decorator-plugin'
import Subscript from '@s524797336/m-editor-subscript-decorator-plugin'
import Del from '@s524797336/m-editor-del-decorator-plugin'
import InlineCode from '@s524797336/m-editor-code-decorator-plugin'
import InlineLink from '@s524797336/m-editor-link-decorator-plugin'
import H from '@s524797336/m-editor-h-line-plugin'
import List from '@s524797336/m-editor-list-line-plugin'
import Blockquote from '@s524797336/m-editor-blockquote-line-plugin'

import Latex from '@s524797336/m-editor-latex-block-plugin'
import Code from '@s524797336/m-editor-code-block-plugin'
import Iframe from '@s524797336/m-editor-iframe-block-plugin'
import Link from '@s524797336/m-editor-link-block-plugin'

import Xterm from './terminal'
import xtermOptions from './terminal/options'
const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const wsPath = window.location.pathname.endsWith('/') ? 'ws' : '/ws';
const url = [
  protocol,
  window.location.host,
  window.location.pathname,
  wsPath,
  window.location.search,
].join('');

const languageList = ['Python', 'XML', 'CSS', 'LESS', 'SCSS', 'Sass', 'JSON', 'JavaScript', 'PHP', 'JSX', 'LaTeX', 'Markdown', 'C', 'C++', 'Java', 'Kotlin', 'SQL', 'Properties files', 'Python', 'Swift', 'Shell']
const leafPlugins = [new Strong(), new Del(), new Italic(), new InlineCode(), new Subscript(), new InlineLink()]
const linePlugins = [new List(), new H(), new Blockquote()]


function App() {
  console.log({ url })
  return (
    <div className="App">
      <Xterm options={xtermOptions} url={'ws://localhost:3300/ws-shell'} id="terminal-container"/>
      {/* <Xterm options={xtermOptions} url={'ws://localhost:18080/ws'} id="terminal-container"/> */}
      <MEditorCatalogProvider onChange={(data) => {}}>
        <MEditor
          // placeHolder={'请在此书写报告'}
        //   blockPlugins={[
        //     // new Annotation(),
        //     new Latex(),
        //     new Link(),
        //     new Code({
        //         languageList,
        //         defaultLanguage: 'JavaScript',
        //         codeMirrorOptions: {
        //             lineNumbers: true
        //         }
        //     }),
        //     new Iframe({
        //         whiteList: [
        //             /^https:\/\/player\.bilibili\.com\/player\.html/,
        //             /^https:\/\/www\.youtube\.com\/embed\//,
        //             /^https:\/\/player\.youku\.com\/embed\//,
        //             /^https:\/\/v\.qq\.com\/iframe\/player\.html/,
        //             /^https:\/\/v\.qq\.com\/txp\/iframe\/player\.html/
        //         ]
        //     })
        // ]}
        // // readonly={readOnly}
        // // defaultValue={editorValue}
        // linePlugins={linePlugins}
        // // placeHolder={(<span>{placeholder}</span>)}
        //   leafPlugins={leafPlugins}
        // onChange={this.onChange}
        />
      </MEditorCatalogProvider>
    </div>
  );
}

export default App;
