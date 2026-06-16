import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  constructor(public authService: AuthService) {}

  checkAdmin(event: MouseEvent): void {
    if (!this.authService.isAdmin()) {
      event.preventDefault();
      alert('Access denied. This section is for ADMIN users only.');
    }
  }

  checkUserRole(event: MouseEvent): void {
    if (!this.authService.isUserRole()) {
      event.preventDefault();
      alert('Access denied. GUEST users are not allowed to access Order Management.');
    }
  }
}
