import React from 'react';
import MEditor from '@s524797336/m-editor'
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

function App() {
  console.log({ url })
  return (
    <div className="App">
      <Xterm options={xtermOptions} url={'ws://localhost:3300/ws-shell'} id="terminal-container"/>
      {/* <Xterm options={xtermOptions} url={'ws://localhost:18080/ws'} id="terminal-container"/> */}
      <MEditor
        placeHolder={'请在此书写报告'}
                                        // readonly={readOnly}
                                        // defaultValue={editorValue}
                                        // blockPlugins={this.blockPlugins}
                                        // linePlugins={linePlugins}
                                        // placeHolder={(<span>{placeholder}</span>)}
                                        // leafPlugins={leafPlugins}
                                        // onChange={this.onChange}
      />
    </div>
  );
}

export default App;
