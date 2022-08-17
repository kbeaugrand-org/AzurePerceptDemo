import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzurePerceptDemoComponent } from './demo.component';

describe('AzurePerceptComponent', () => {
  let component: AzurePerceptDemoComponent;
  let fixture: ComponentFixture<AzurePerceptDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AzurePerceptDemoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AzurePerceptDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
