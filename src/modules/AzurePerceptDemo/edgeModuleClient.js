'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

module.exports = function (webServer) {
    this.webServer = webServer;

    this.startModuleClient = function () {
        Client.fromEnvironment(Transport, function (err, client) {
            if (err) {
              throw err;
            }
          
            client.on('error', function (err) {
              throw err;
            });
          
            // connect to the Edge instance
            client.open(function (err) {
              if (err) {
                throw err;
              } else {
                console.log('IoT Hub module client initialized');
          
                // Act on input messages to the module.
                client.on('inputMessage', function (inputName, msg) {
                  webServer.sendTelemetry(msg.getBytes().toString('utf8'));
                });
              }
            });
          });
    }
}

// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
    client.complete(msg, printResultFor('Receiving message'));
  
    if (inputName === 'inputMessage') {
      var message = msg.getBytes().toString('utf8');
      console.log('Input message received: ' + message);
    }
  }
  
// Helper function to print results in the console
function printResultFor(op) {
    return function printResult(err, res) {
      if (err) {
        console.log(op + ' error: ' + err.toString());
      }
      if (res) {
        console.log(op + ' status: ' + res.constructor.name);
      }
    };
  }