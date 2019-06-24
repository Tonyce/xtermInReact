import React from 'react';
import Xterm from './terminal'

const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const wsPath = window.location.pathname.endsWith('/') ? 'ws' : '/ws';
const url = [
  protocol,
  window.location.host,
  window.location.pathname,
  wsPath,
  window.location.search,
].join('');

const xtermOptions = {
  fontSize: 13,
  fontFamily:
    'Menlo For Powerline,Consolas,Liberation Mono,Menlo,Courier,monospace',
  theme: {
    foreground: '#d2d2d2',
    background: '#2b2b2b',
    cursor: '#adadad',
    black: '#000000',
    red: '#d81e00',
    green: '#5ea702',
    yellow: '#cfae00',
    blue: '#427ab3',
    magenta: '#89658e',
    cyan: '#00a7aa',
    white: '#dbded8',
    brightBlack: '#686a66',
    brightRed: '#f54235',
    brightGreen: '#99e343',
    brightYellow: '#fdeb61',
    brightBlue: '#84b0d8',
    brightMagenta: '#bc94b7',
    brightCyan: '#37e6e8',
    brightWhite: '#f1f1f0',
  }
} 

function App() {
  console.log({ url })
  return (
    <div className="App">
      <Xterm options={xtermOptions} url={'ws://localhost:8080/ws'} id="terminal-container"/>
    </div>
  );
}

export default App;
