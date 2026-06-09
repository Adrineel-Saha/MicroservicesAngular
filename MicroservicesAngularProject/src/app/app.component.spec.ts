import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent, NavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'MicroservicesAngularProject'`, () => {
    expect(component.title).toEqual('MicroservicesAngularProject');
  });

  it('should render the navigation component', () => {
    fixture.detectChanges();
    const navigation = debugElement.query(By.css('app-navigation'));
    expect(navigation).toBeTruthy();
    expect(nativeElement.querySelector('app-navigation')).toBe(navigation.nativeElement);
  });

  it('should host a single navigation component', () => {
    fixture.detectChanges();
    const navigations = debugElement.queryAll(By.css('app-navigation'));
    expect(navigations.length).toBe(1);
  });
});
