import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemsByProductComponent } from './list-items-by-product.component';

describe('ListItemsByProductComponent', () => {
  let component: ListItemsByProductComponent;
  let fixture: ComponentFixture<ListItemsByProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListItemsByProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListItemsByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
