'use strict';

const EdgeModuleClient = require('./edgeModuleClient.js');
const WebServer = require('./webServer.js');

var webServer = new WebServer();
webServer.startServer();

var module = new EdgeModuleClient(webServer);
module.startModuleClient();