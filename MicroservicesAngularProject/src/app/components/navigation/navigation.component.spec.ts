import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { NavigationComponent } from './navigation.component';
import { AuthService } from '../../services/auth.service';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;

  // Stub AuthService: navbar is gated behind isLoggedIn() and ADMIN/USER role checks.
  const authStub: Partial<AuthService> = {
    isLoggedIn: () => true,
    isAdmin: () => true,
    isUserRole: () => true
  };

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
    { route: '/updateOrder', label: 'Update Existing Order Status' },
    { route: '/updateOrderItem', label: 'Update Existing Order Item' },
    { route: '/deleteUser', label: 'Delete Existing User' },
    { route: '/logout', label: 'Logout' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [NavigationComponent],
      providers: [{ provide: AuthService, useValue: authStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a navbar', () => {
    const navbar = debugElement.query(By.css('nav.navbar'));
    expect(navbar).toBeTruthy();
    expect(nativeElement.querySelector('nav.navbar')).toBe(navbar.nativeElement);
  });

  it('should render all navigation links', () => {
    const links = debugElement.queryAll(By.css('a.nav-link'));
    expect(links.length).toBe(expectedLinks.length);
  });

  it('should render one nav-item per link', () => {
    const items = debugElement.queryAll(By.css('li.nav-item'));
    expect(items.length).toBe(expectedLinks.length);
  });

  expectedLinks.forEach(({ route, label }) => {
    it(`should have a routerLink to ${route}`, () => {
      const links = debugElement.queryAll(By.css('a.nav-link'));
      const target = links.find(
        link => (link.nativeElement as HTMLElement).getAttribute('ng-reflect-router-link') === route
      );
      expect(target).toBeTruthy();
    });

    it(`should label the ${route} link as "${label}"`, () => {
      const links = debugElement.queryAll(By.css('a.nav-link'));
      const target = links.find(
        link => (link.nativeElement as HTMLElement).getAttribute('ng-reflect-router-link') === route
      );
      expect((target?.nativeElement as HTMLElement)?.textContent?.trim()).toBe(label);
    });
  });

  it('should not contain duplicate routerLinks', () => {
    const routes = debugElement
      .queryAll(By.css('a.nav-link'))
      .map(link => (link.nativeElement as HTMLElement).getAttribute('ng-reflect-router-link'));
    const uniqueRoutes = new Set(routes);
    expect(uniqueRoutes.size).toBe(routes.length);
  });
});
