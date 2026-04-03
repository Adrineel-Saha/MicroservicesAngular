import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOrderItemComponent } from './update-order-item.component';

describe('UpdateOrderItemComponent', () => {
  let component: UpdateOrderItemComponent;
  let fixture: ComponentFixture<UpdateOrderItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateOrderItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
