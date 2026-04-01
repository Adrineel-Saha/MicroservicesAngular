import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOrdersByUserComponent } from './list-orders-by-user.component';

describe('ListOrdersByUserComponent', () => {
  let component: ListOrdersByUserComponent;
  let fixture: ComponentFixture<ListOrdersByUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListOrdersByUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOrdersByUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
