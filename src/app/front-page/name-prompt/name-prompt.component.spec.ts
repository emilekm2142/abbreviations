import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamePromptComponent } from './name-prompt.component';

describe('NamePromptComponent', () => {
  let component: NamePromptComponent;
  let fixture: ComponentFixture<NamePromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamePromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
