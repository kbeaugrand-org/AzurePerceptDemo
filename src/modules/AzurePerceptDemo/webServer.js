'use strict';

const path = require('path');
const express = require('express');
const WebSocket = require('ws');

let sockets = [];

const app = express();

function startExpress() {

    app.use(express.static(path.join(__dirname, './wwwroot/')));

    app.listen(8080, () => {
        console.log('Server started!')
    });
}

function startWebSocket() {
    const wss = new WebSocket.Server({ port: 8081 });

    wss.on('connection', ws => {
        sockets.push(ws);

        ws.on('message', message => {
            console.log(`Received message => ${message}`)
        });

        ws.on('close', () => {
            sockets = sockets.filter(s => s !== ws);
        });
    });
}

module.exports = function () {
    this.startServer = function () {
        startExpress();
        startWebSocket();
    }

    this.sendTelemetry = function (msg) {
        sockets.forEach(s => {
            try {
                s.send(msg)
            } catch (e) {
                console.log(e)
            }
        });
    }
}