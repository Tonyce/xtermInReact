import React from 'react';
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
    </div>
  );
}

export default App;
