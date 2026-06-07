import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  const expectedLinks: { route: string; label: string }[] = [
    { route: '/createUser', label: 'Add New User' },
    { route: '/createProduct', label: 'Add New Product' },
    { route: '/createOrder', label: 'Add New Order' },
    { route: '/createOrderItem', label: 'Add New Order Item' },
    { route: '/listUsers', label: 'View all Users' },
    { route: '/listProductsByName', label: 'View Products By Name' },
    { route: '/listOrdersByUser', label: 'View Orders By User' },
    { route: '/listItemsByProduct', label: 'View Items By Product' },
    { route: '/updateUser', label: 'Update Existing User' },
    { route: '/updateProduct', label: 'Update Existing Product' },
    { route: '/updateOrder', label: 'Update Existing Order' },
    { route: '/updateOrderItem', label: 'Update Existing Order Item' },
    { route: '/deleteUser', label: 'Delete Existing User' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [NavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a navbar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav.navbar')).toBeTruthy();
  });

  it('should render all navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a.nav-link');
    expect(links.length).toBe(expectedLinks.length);
  });

  it('should render one nav-item per link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('li.nav-item');
    expect(items.length).toBe(expectedLinks.length);
  });

  expectedLinks.forEach(({ route, label }) => {
    it(`should have a routerLink to ${route}`, () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = Array.from(compiled.querySelectorAll('a.nav-link'));
      const target = links.find(
        link => link.getAttribute('ng-reflect-router-link') === route
      );
      expect(target).toBeTruthy();
    });

    it(`should label the ${route} link as "${label}"`, () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = Array.from(compiled.querySelectorAll('a.nav-link'));
      const target = links.find(
        link => link.getAttribute('ng-reflect-router-link') === route
      );
      expect(target?.textContent?.trim()).toBe(label);
    });
  });

  it('should not contain duplicate routerLinks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routes = Array.from(compiled.querySelectorAll('a.nav-link')).map(
      link => link.getAttribute('ng-reflect-router-link')
    );
    const uniqueRoutes = new Set(routes);
    expect(uniqueRoutes.size).toBe(routes.length);
  });
});
