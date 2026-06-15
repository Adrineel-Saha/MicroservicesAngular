import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'auth_username';
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  showSignup: boolean = false;

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  register(username: string, email: string, password: string, role: string): Observable<any> {
    return this.http.post<any>('http://localhost:9191/api/auth/register', { userName: username, email, password, role });
  }

  login(username: string, password: string): Observable<string> {
    return this.http.post('http://localhost:9191/api/auth/token', { userName: username, password }, { responseType: 'text' }).pipe(
      tap(token => {
        if (token) {
          sessionStorage.setItem(this.TOKEN_KEY, token);
          sessionStorage.setItem(this.USERNAME_KEY, username);
          this.startInactivityTimer();
        }
      })
    );
  }

  logout(): void {
    this.clearInactivityTimer();
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USERNAME_KEY);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  private getTokenRemainingMs(): number {
    const token = this.getToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Math.max(0, payload.exp * 1000 - Date.now());
    } catch { return 0; }
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    return sessionStorage.getItem(this.USERNAME_KEY);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isUserRole(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'USER' || role === 'MODERATOR';
  }

  resetInactivityTimer(): void {
    if (this.isLoggedIn()) {
      this.startInactivityTimer();
    }
  }

  private startInactivityTimer(): void {
    this.clearInactivityTimer();
    const remainingMs = this.getTokenRemainingMs();
    if (remainingMs <= 0) { this.logout(); return; }
    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => this.logout());
      }, remainingMs);
    });
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer !== null) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}
