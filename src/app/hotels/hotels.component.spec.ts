import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsGridLeftSidebarComponent } from './hotels-grid-left-sidebar.component';

describe('HotelsGridLeftSidebarComponent', () => {
  let component: HotelsGridLeftSidebarComponent;
  let fixture: ComponentFixture<HotelsGridLeftSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotelsGridLeftSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelsGridLeftSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
