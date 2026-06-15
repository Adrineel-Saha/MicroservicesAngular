import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  usernameControl!: FormControl;
  passwordControl!: FormControl;

  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.usernameControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)
    ]);
    this.passwordControl = new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]);
    this.loginForm = new FormGroup({
      username: this.usernameControl,
      password: this.passwordControl
    });
  }

  goToSignup(): void {
    this.authService.showSignup = true;
  }

  checkLogin(): void {
    if (this.loginForm.invalid) return;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password. Please try again.';
      }
    });
  }
}
