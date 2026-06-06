import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

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

  it('should render all navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a.nav-link');
    expect(links.length).toBe(13);
  });

  it('should have a routerLink to /createUser', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a.nav-link'));
    const target = links.find(link => link.getAttribute('ng-reflect-router-link') === '/createUser');
    expect(target).toBeTruthy();
  });

  it('should have a routerLink to /deleteUser', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a.nav-link'));
    const target = links.find(link => link.getAttribute('ng-reflect-router-link') === '/deleteUser');
    expect(target).toBeTruthy();
  });
});
