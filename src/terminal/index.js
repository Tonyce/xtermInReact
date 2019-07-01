import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Terminal } from 'xterm';
// import { fit } from 'xterm/lib/addons/fit/fit';
import * as fit from 'xterm/lib/addons/fit/fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
// import { FitAddon } from 'xterm-addon-fit';
import Zmodem from 'zmodem.js/src/zmodem_browser'

import OverlayAddon from './overlay';

import 'xterm/dist/xterm.css';

Terminal.applyAddon(fit)

const Command = {
    // server side
    OUTPUT: '0',
    SET_WINDOW_TITLE: '1',
    SET_PREFERENCES: '2',
    SET_RECONNECT: '3',
  
    // client side
    INPUT: '0',
    RESIZE_TERMINAL: '1',
}
  

export default class Xterm extends Component {
    static propTypes = {
        url: PropTypes.string,
        id: PropTypes.string,
        options: PropTypes.object
    }
    onSocketOpen = () => {
        console.log('[ttyd] Websocket connection opened');
        const {
            socket,
            textEncoder,
            // fitAddon,
            terminal
        } = this;
        const authToken = window.tty_auth_token;
    
        socket.send(textEncoder.encode(JSON.stringify({ AuthToken: authToken })));
        // fitAddon.fit();
        terminal.fit();
        // fit.fit(terminal);
    }
    onSocketData = (event) => {
        const { terminal, textDecoder, socket } = this;
        const rawData = event.data // ArrayBuffer;
        const cmd = String.fromCharCode(new Uint8Array(rawData)[0]);
        console.log('------', { rawData, cmd })
        const data = rawData.slice(1);

        switch (cmd) {
          case '9':
            this.onSocketOpen()
            break;
          case Command.OUTPUT:
            try {
              this.sentry.consume(data);
            } catch (e) {
              console.log(`[ttyd] zmodem consume: `, e);
              this.reconnect = 0.5;
              socket.close();
            }
            break;
          case Command.SET_WINDOW_TITLE:
            this.title = textDecoder.decode(data);
            document.title = this.title;
            break;
          case Command.SET_PREFERENCES:
            const preferences = JSON.parse(textDecoder.decode(data));
            Object.keys(preferences).forEach(key => {
              console.log(`[ttyd] setting ${key}: ${preferences[key]}`);
              terminal.setOption(key, preferences[key]);
            });
            break;
          case Command.SET_RECONNECT:
            this.reconnect = Number(textDecoder.decode(data));
            console.log(`[ttyd] enabling reconnect: ${this.reconnect} seconds`);
            break;
          default:
            console.warn(`[ttyd] unknown command: ${cmd}`);
            break;
        }
    }
    onSocketClose = (event /* CloseEvent */) => {
        console.log(`[ttyd] websocket connection closed with code: ${event.code}`);
    
        const { overlayAddon, openTerminal, reconnect } = this;
        overlayAddon.showOverlay('Connection Closed', null);
        window.removeEventListener('beforeunload', this.onWindowUnload);
    
        // 1008: POLICY_VIOLATION - Auth failure
        if (event.code === 1008) {
            window.location.reload();
        }
        // 1000: CLOSE_NORMAL
        if (event.code !== 1000 && reconnect > 0) {
            setTimeout(openTerminal, reconnect * 1000);
        }
    }
    openTerminal = () => {
        if (this.terminal) {
            this.terminal.dispose();
        }
        const { url, options } = this.props;
        
        this.socket = new WebSocket(url, ['tty']);
        this.terminal = new Terminal(options);

        const { socket, terminal, container, fitAddon, overlayAddon } = this;
        window.term = terminal;
    
        socket.binaryType = 'arraybuffer';
        // socket.onopen = this.onSocketOpen;
        socket.onmessage = this.onSocketData;
        socket.onclose = this.onSocketClose;
    
        // terminal.applyAddon(fitAddon);
        terminal.loadAddon(overlayAddon);
        terminal.loadAddon(new WebLinksAddon());
    
        terminal.onTitleChange(data => {
            if (data && data !== '') {
                document.title = data + ' | ' + this.title;
            }
        });
        terminal.onData(this.onTerminalData);
        terminal.onResize(this.onTerminalResize);
        if (
            document.queryCommandSupported &&
            document.queryCommandSupported('copy')
        ) {
            terminal.onSelectionChange(() => {
                overlayAddon.showOverlay('\u2702', 200);
                document.execCommand('copy');
            });
        }
        terminal.open(container.current);
        terminal.focus();
    
        window.addEventListener('resize', this.onWindowResize);
        window.addEventListener('beforeunload', this.onWindowUnload); 
    }

    onTerminalData = (data) => {
        const { socket, textEncoder } = this;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(textEncoder.encode(Command.INPUT + data));
        }
    }

    onTerminalResize = (size) => { //{ cols: number; rows: number }
        const { overlayAddon, socket, textEncoder } = this;
        if (socket.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({ columns: size.cols, rows: size.rows });
            socket.send(textEncoder.encode(Command.RESIZE_TERMINAL + msg));
        }
        setTimeout(() => {
            overlayAddon.showOverlay(`${size.cols}x${size.rows}`);
        }, 500);
      }

    onWindowResize = () => {
        // const { fitAddon } = this;
        clearTimeout(this.resizeTimeout);
        // this.resizeTimeout = setTimeout(() => fitAddon.fit(), 250);
        this.resizeTimeout = setTimeout(() => this.terminal.fit(), 250);
    }
    onWindowUnload = (event) => {
        const message = 'Close terminal? this will also terminate the command.';
        event.returnValue = message;
        return message;
    }

    zmodemWrite = (data /* ArrayBuffer*/) => {
        const { terminal } = this;
        terminal.writeUtf8(new Uint8Array(data));
    }
    zmodemSend = (data /* ArrayLike<number> */) => {
        const { socket } = this;
        const payload = new Uint8Array(data.length + 1);
        payload[0] = Command.INPUT.charCodeAt(0);
        payload.set(data, 1);
        socket.send(payload);
    }
    zmodemDetect = (detection) => {
        const { terminal, receiveFile } = this;
    
        terminal.setOption('disableStdin', true);
        this.session = detection.confirm();
        if (this.session.type === 'send') {
            this.setState({ modal: true });
        } else {
            receiveFile();
        }
    }
    receiveFile() {
        const { terminal, session, writeProgress } = this;
    
        session.on('offer', (xfer) => {
          const fileBuffer = [];
          xfer.on('input', payload => {
            writeProgress(xfer);
            fileBuffer.push(new Uint8Array(payload));
          });
          xfer.accept().then(() => {
            Zmodem.Browser.save_to_disk(fileBuffer, xfer.get_details().name);
            terminal.setOption('disableStdin', false);
          });
        });
    
        session.start();
      }
    constructor(props) {
        super(props)
        this.terminal = ''
        this.socket = '' // webSocket
        // console.log(FitAddon)
        // this.fitAddon = new FitAddon();
        this.fitAddon = fit;
        this.overlayAddon = new OverlayAddon();
        this.container = React.createRef()

        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder();

        this.sentry = new Zmodem.Sentry({
            to_terminal: (octets /* ArrayBuffer */) => this.zmodemWrite(octets),
            sender: (octets /* ArrayLike<number> */) => this.zmodemSend(octets),
            on_retract: () => {},
            on_detect: (detection) => this.zmodemDetect(detection),
        });

        this.state = {
            modal: false
        }
    }
    componentDidMount() {
        this.openTerminal();
    }
    componentWillUnmount() {
        this.socket.close();
        this.terminal.dispose();
    
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('beforeunload', this.onWindowUnload);
    }
    render() {
        const { id } = this.props;
        const { modal } = this.state;
        console.log({ modal })
        return (
            <div id={id} ref={this.container}></div>
        )
    }
}
