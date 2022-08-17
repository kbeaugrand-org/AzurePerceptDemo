import { Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'azure-percept-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.sass'],
})
export class AzurePerceptVideoStreamComponent implements OnInit {
  private queue = new Uint8Array()
  private isPaused = true
  private buffer: any
  private foundJpegHead = false
  private frameCount = 0
  private websocket: any[] = []
  private mysocket: any
  private streams = 0

  private streamHost = environment.production
    ? window.location.hostname
    : '192.168.1.88'

  index: number = 0

  ngOnInit(): void {
    this.GetStreamNumber()
    var wait_streamnum = setInterval(() => {
      console.log('check data streams: ' + this.streams)
      if (this.streams > 0) {
        this.OnClickPlay()
        clearInterval(wait_streamnum)
      }
    }, 1000)
  }

  renderImage(imgBuffer: any, streamnum: number) {
    this.frameCount++
    if (this.frameCount % 5 != 0) {
      return
    }
    // console.log('renderImage... frame#=' + frameCount + ", len=" + imgBuffer.byteLength);

    var packet = new Uint8Array(imgBuffer)
    // console.log('image... head=' + packet[0].toString() + ", " + packet[1].toString() + ', end=' + packet[packet.byteLength-2].toString() + ", " + packet[packet.byteLength-1].toString());

    var i = imgBuffer.length
    var binaryString = [i]
    while (i--) {
      binaryString[i] = String.fromCharCode(imgBuffer[i])
    }
    var data = binaryString.join('')

    var base64 = window.btoa(data)
    var img = new Image()
    img.src = 'data:image/jpeg;base64,' + base64
    //img.src = imgBuffer;
    setTimeout(() => {
      this.updateImage(img, streamnum)
    }, 50)
  }

  concatByteArray(a1: any, a2: any) {
    var anew = new Uint8Array(a1.length + a2.length)
    anew.set(a1)
    anew.set(a2, a1.length)
    return anew
  }

  parseMediaStream(payload: any, streamnum: number) {
    try {
      if (typeof payload !== 'string') {
        // console.log('parseMediaStream... ' + queue.length);
        // console.log('streamnum: ' + streamnum);
        var packet = new Uint8Array(payload)

        if (packet.length > 0) {
          var index = 0
          var lastByte = null
          var curByte = null
          var headIndex = 0

          if (this.queue.length > 0) {
            lastByte = this.queue[this.queue.length - 1]
            curByte = packet[index++]
          } else {
            lastByte = packet[index++]
          }
          curByte = packet[index++]

          while (index <= packet.length) {
            if (this.foundJpegHead && lastByte == 255 && curByte == 217) {
              // JPEG image end (FF D9)
              // console.log('found image end at ' + (index+2));
              this.queue = this.concatByteArray(
                this.queue,
                packet.slice(headIndex, index + 2),
              )
              this.renderImage(this.queue, streamnum)
              this.queue = new Uint8Array()
              this.foundJpegHead = false
              headIndex = 0
            } else if (lastByte == 255 && curByte == 216) {
              // JPEG image head (FF D8)
              // console.log('found image head at ' + (index-2));

              if (this.foundJpegHead) {
                this.queue = this.concatByteArray(
                  this.queue,
                  packet.slice(headIndex, index - 1),
                )
                this.renderImage(this.queue, streamnum)
                this.queue = new Uint8Array()
              }

              headIndex = index - 2
              if (headIndex < 0) {
                this.queue = new Uint8Array([0xff])
                headIndex = 0
              }
              this.foundJpegHead = true
            }
            lastByte = curByte
            curByte = packet[index++]
          }
          if (this.foundJpegHead) {
            this.queue = this.concatByteArray(
              this.queue,
              packet.slice(headIndex, index - 1),
            )
            // console.log('keep parsed data in queue ' + (index - headIndex-1) + " / " + queue.length);
          }
        }
      }
    } catch (err) {
      console.error('Exception in parsing mediastream payload!')
      console.log(err)
    }
  }

  OnClickPlay() {
    console.log('OnClickPlay fired. isPaused: ' + this.isPaused)
    var index = 0
    var port_index = 3000
    var wsPort = 0

    var frameNumber = 0

    if (!this.isPaused) {
      return
    }

    this.isPaused = false
    //    console.log('streams = ' + streams);
    while (index < this.streams) {
      wsPort = port_index + (index + 1) * 2
      this.websocket[index] = new WebSocket(
        'ws://' + this.streamHost + ':' + wsPort,
      ) // ex: new WebSocket('ws://10.168.110.53:3002')
      this.websocket[index].binaryType = 'arraybuffer'
      this.websocket[index].index = index
      this.websocket[index].onopen = (event: any) => {
        try {
          console.log('Connection established.')
        } catch (err) {
          console.error('Exception opening websocket!')
          console.log(err)
        }
      }

      this.websocket[index].addEventListener(
        'message',
        (e: any) => {
          // console.log('New message... len=' + e.data.byteLength);
          try {
            if (typeof e.data !== 'string') {
              let payload = e.data
              let streamindex = e.currentTarget.index
              //                    console.log('addEventListener index: ' + streamindex);
              this.parseMediaStream(payload, streamindex)
            }
          } catch (err) {
            console.error('Exception in websocket message!')
            console.log(err)
          }
        },
        false,
      )

      this.websocket[index].onerror = (event: any) => {
        console.error('WebSocket error!')
        console.log(event)
        console.log(
          'WebSocket ready state: ' +
            this.websocket[event.currentTarget.index].readyState,
        )
      }

      this.websocket[index].onclose = (event: any) => {
        let reason
        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
        if (event.code === 1000)
          reason = `Normal closure, meaning that the purpose for which the connection was established has been fulfilled.`
        else reason = `Error!`

        if (event.code !== 1000) {
          console.error('WebSocket closed due to: ' + reason)
        } else {
          console.log('WebSocket closed due to: ' + reason)
        }

        console.log(event)

        // restart the video stream on network errors
        if (!this.isPaused) {
          this.isPaused = true
          this.OnClickPlay()
        }
      }

      index++
    }
  }

  scaleRect(srcSize: any, dstSize: any) {
    var ratio = Math.min(
      dstSize.width / srcSize.width,
      dstSize.height / srcSize.height,
    )
    var newRect = {
      x: 0,
      y: 0,
      width: srcSize.width * ratio,
      height: srcSize.height * ratio,
    }
    newRect.x = dstSize.width / 2 - newRect.width / 2
    newRect.y = dstSize.height / 2 - newRect.height / 2

    return newRect
  }

  updateImage(img: any, streamnum: any) {
    var elment_str = 'player' + streamnum
    //    console.log('updateImage elment_str: ' + elment_str);
    var canvas: any = document.getElementById(elment_str)
    var context = canvas.getContext('2d')
    var srcRect = {
      x: 0,
      y: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
    }
    var dstRect = this.scaleRect(srcRect, {
      width: canvas.width,
      height: canvas.height,
    })

    try {
      // console.log("updateImage");
      context.drawImage(
        img,
        srcRect.x,
        srcRect.y,
        srcRect.width,
        srcRect.height,
        dstRect.x,
        dstRect.y,
        dstRect.width,
        dstRect.height,
      )
      // console.log(".");
    } catch (e) {
      self.stop()
      console.log('stop!')
      throw e
    }
  }

  GetStreamNumber() {
    console.log('GetStreamNumber fired')

    this.mysocket = new WebSocket('ws://' + this.streamHost + ':2999')
    this.mysocket.onopen = (event: any) => {
      try {
        console.log('Connection established.')
        this.mysocket.send('StreamNumber')
        console.log('Connection established send out msg.')
      } catch (err) {
        console.error('Exception opening websocket!')
        console.log(err)
      }
    }

    this.mysocket.addEventListener(
      'message',
      (e: any) => {
        this.streams = Number(e.data)
        console.log('New message... e.data=' + this.streams)
        var index = 0
        while (index < this.streams) {
          this.index = index
          index++
        }
      },
      false,
    )

    this.mysocket.onerror = (event: any) => {
      console.error('WebSocket error!')
      console.log(event)
      console.log(
        'WebSocket ready state: ' +
          this.websocket[event.currentTarget.index].readyState,
      )
    }

    this.mysocket.onclose = (event: any) => {
      let reason
      // See http://tools.ietf.org/html/rfc6455#section-7.4.1
      if (event.code === 1000)
        reason = `Normal closure, meaning that the purpose for which the connection was established has been fulfilled.`
      else reason = `Error!`

      if (event.code !== 1000) {
        console.error('WebSocket closed due to: ' + reason)
      } else {
        console.log('WebSocket closed due to: ' + reason)
      }

      console.log(event)
    }
  }
}
