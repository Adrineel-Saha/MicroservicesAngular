import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  constructor(public authService: AuthService, private router: Router) {}

  navigateIfAdmin(route: string): void {
    if (this.authService.isAdmin()) {
      this.router.navigate([route]);
    } else {
      alert('Access denied. This section is for ADMIN users only.');
    }
  }

  navigateIfUserRole(route: string): void {
    if (this.authService.isUserRole()) {
      this.router.navigate([route]);
    } else {
      alert('Access denied. GUEST users are not allowed to access Order Management.');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
