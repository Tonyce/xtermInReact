const express = require('express');
const app = express();
const os = require('os');
const pty = require('node-pty');
const WebSocketClient = require('websocket').client;
require('express-ws')(app);
const { TextDecoder, TextEncoder } = require('util')

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
 
app.use(express.static(`.`));
 
app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});

app.ws('/ws-shell', function(ws, req) {
  ws.send('hi')
  const client = new WebSocketClient();
  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });
 
  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    // connection.on('data', (data) => {
    //   console.log(data)
    //     ws.send(data);
    // });
    // For all websocket data send it to the shell

    ws.send(textEncoder.encode('9'))

    ws.on('close', () => {
      connection.close();
    })
    ws.on('message', (msg) => {
      console.log({ msg })
      connection.send(msg);
    });

    // connection.on('error', function(error) {
    //   ws.send(error);
    // });
    connection.on('close', function() {
      ws.close()
    });
    connection.on('message', function(message) {
      // console.log({message})
      ws.send(message.binaryData);
    });
  });
  client.connect('ws://localhost:18080/ws', 'tty');
})

app.ws('/shell', function(ws, req){
    var ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
      });

    ptyProcess.on('data', (data) => {
      console.log(data)
        ws.send(data);
    });
    // For all websocket data send it to the shell
    ws.on('message', (msg) => {
      ptyProcess.write(msg);
    });
})

app.listen(3300);

// app.use(function (req, res, next) {
//   console.log('middleware');
//   req.testing = 'testing';
//   return next();
// });
 
// app.get('/', function(req, res, next){
//   console.log('get route', req.testing);
//   res.end();
// });

// const readme = fs.createReadStream('./readme.md')
 

// const shell = pty.spawn('/bin/bash', [], {
    //     name: 'xterm-color',
    //     cwd: process.env.PWD,
    //     env: process.env
    // });
    // For all shell data send it to the websocket

// app.ws('/shell/readme', function(ws, req){
//   // var ptyProcess = pty.spawn(shell, [], {
//   //     name: 'xterm-color',
//   //     cols: 80,
//   //     rows: 30,
//   //     cwd: process.env.HOME,
//   //     env: process.env
//   //   });
//   // const shell = pty.spawn('/bin/bash', [], {
//   //     name: 'xterm-color',
//   //     cwd: process.env.PWD,
//   //     env: process.env
//   // });
//   // For all shell data send it to the websocket
//   readme.on('data', (data) => {
//       console.log(data)
//       ws.send(data);
//   });
//   // For all websocket data send it to the shell
//   // ws.on('message', (msg) => {
//   //   ptyProcess.write(msg);
//   // });

// })