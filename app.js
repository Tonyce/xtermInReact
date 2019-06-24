var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
const fs = require('fs')
var os = require('os');
var pty = require('node-pty');
 
var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
 
app.use(express.static(`.`));
// app.use(function (req, res, next) {
//   console.log('middleware');
//   req.testing = 'testing';
//   return next();
// });
 
// app.get('/', function(req, res, next){
//   console.log('get route', req.testing);
//   res.end();
// });
 
app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});

app.ws('/shell', function(ws, req){
    var ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
      });
    // const shell = pty.spawn('/bin/bash', [], {
    //     name: 'xterm-color',
    //     cwd: process.env.PWD,
    //     env: process.env
    // });
    // For all shell data send it to the websocket
    ptyProcess.on('data', (data) => {
      console.log(data)
        ws.send(data);
    });
    // For all websocket data send it to the shell
    ws.on('message', (msg) => {
      ptyProcess.write(msg);
    });

})

// const readme = fs.createReadStream('./readme.md')

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
 
app.listen(3300);