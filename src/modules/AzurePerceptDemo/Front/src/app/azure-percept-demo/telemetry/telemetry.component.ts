import { Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { environment } from 'src/environments/environment'

export interface NeuralNetworkResult {
  bbox: string
  label: string
  confidence: number
  timestamp: number
}

export interface EyeModuleTelemetry {
  NEURAL_NETWORK: NeuralNetworkResult[]
}

@Component({
  selector: 'azure-percept-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.sass'],
})
export class AzurePerceptTelemetryComponent implements OnInit {
  public dataSource: MatTableDataSource<NeuralNetworkResult>
  public displayedColumns: string[] = ['timestamp', 'label', 'confidence']

  @ViewChild('telemetryTable', { static: true }) telemetryTable: any

  constructor() {
    this.dataSource = new MatTableDataSource<NeuralNetworkResult>()
  }

  ngOnInit(): void {
    const webSocketUrl = 'ws://' +
    (environment.production ? window.location.hostname : 'localhost') +
    ':8081';

    console.log(`Connecting to ${webSocketUrl}`);

    const ws = new WebSocket(webSocketUrl);

    ws.onopen = function (event: any) {
      try {
        console.log('Connection established.')
      } catch (err) {
        console.error('Exception opening websocket!')
        console.log(err)
      }
    }

    ws.addEventListener(
      'message',
      (e: any) => {
        console.log('New message... e.data=' + e.data)
        var telemetry = JSON.parse(e.data) as EyeModuleTelemetry
        console.debug(telemetry.NEURAL_NETWORK)

        telemetry.NEURAL_NETWORK.forEach((element) => {
          // Set the timestamp to ms since epoch
          element.timestamp = element.timestamp / 1000 / 1000

          this.dataSource.data.unshift(element)

          // Keep only the last 12 rows
          while (this.dataSource.data.length > 12) {
            this.dataSource.data.pop()
          }

          this.telemetryTable.renderRows()
        })
      },
      false,
    )
    ws.onerror = (event: any) => {
      console.error('WebSocket error!')
      console.log(event)
    }
  }
}
