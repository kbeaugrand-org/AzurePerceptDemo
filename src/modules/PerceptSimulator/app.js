'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
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
          pipeMessage(client, inputName, msg);
        });
        
        setInterval(() => {
          client.sendEvent(new Message(JSON.stringify({
            "NEURAL_NETWORK": [
              {
                "bbox": [
                  0.743,
                  0.425,
                  0.847,
                  0.677
                ],
                "label": "person",
                "confidence": "0.765137",
                "timestamp": "1659861102820504491"
              },
              {
                "bbox": [
                  0.157,
                  0.084,
                  0.42,
                  0.635
                ],
                "label": "potted plant",
                "confidence": "0.785645",
                "timestamp": "1659861102820504491"
              }
            ]
          })))
        }, 1000);
      }
    });
  }
});

// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    if (message) {
      var outputMsg = new Message(message);
      client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
    }
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
