import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';

import { MatTableModule } from '@angular/material/table'

import { AzurePerceptDemoComponent } from './demo/demo.component';
import { AzurePerceptVideoStreamComponent } from './video-stream/video-stream.component';
import { AzurePerceptTelemetryComponent } from './telemetry/telemetry.component';

@NgModule({
  declarations: [
    AzurePerceptDemoComponent,
    AzurePerceptVideoStreamComponent,
    AzurePerceptTelemetryComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    TimeagoModule
  ],
  exports: [
    TimeagoModule,
    MatTableModule,
    AzurePerceptDemoComponent
  ]
})
export class AzurePerceptModule { }
