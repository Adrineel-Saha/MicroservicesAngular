import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderItemComponent } from './create-order-item.component';

describe('CreateOrderItemComponent', () => {
  let component: CreateOrderItemComponent;
  let fixture: ComponentFixture<CreateOrderItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrderItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
