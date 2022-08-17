# Azure Percept Demo

This project is a sample demonstrating the use of Azure Percept data acquisition and rendering to a web page.

The Web application is executing an Angular 14 SPA hosted by an Azure IoT Edge module executed directly on the Azure Percept device.
The IoT Edge module streams the Percept predictions from the Edge Hub to the Angular application via WebSockets.

The Angular application displays the Eye video stream from WebStream module (from Motion Jpeg stream) to the Web page.

## Demo

![image](https://user-images.githubusercontent.com/9513635/185103620-9f5bc371-5eb9-42ee-a5b3-7342b64b23c0.png)

## Usage

To use the module, you need to deploy the following Azure IoT Edge module:

```json
 "AzurePerceptDemo": {
        "restartPolicy": "always",
        "settings": {
            "image": "ghcr.io/kbeaugrand-org/azureperceptdemo:latest",
            "createOptions": "{\"ExposedPorts\":{\"8080/tcp\":{},\"8081/tcp\":{}},\"HostConfig\":{\"PortBindings\":{\"8080/tcp\":[{\"HostPort\":\"8080\"}],\"8081/tcp\":[{\"HostPort\":\"8081\"}]}}}"
        },
        "status": "running",
        "type": "docker"
    }
```

### Edge Hub routing

```json
    "routes": {
        "AzureEyeModuleToIoTHub": "FROM /messages/modules/azureeyemodule/outputs/* INTO $upstream",
        "AzureEyeModuleToPerceptDemo": "FROM /messages/modules/azureeyemodule/outputs/*  INTO BrokeredEndpoint(\"/modules/AzurePerceptDemo/inputs/inputMessage\")"
    },
```

### Access to the stream

Once connected, you can go to [http://your.new.device:8080](http://your.new.device:8080) to access to the Web page.

## License

This project is licensed under the MIT License (see [LICENSE.md](LICENSE.md)) for more details.
