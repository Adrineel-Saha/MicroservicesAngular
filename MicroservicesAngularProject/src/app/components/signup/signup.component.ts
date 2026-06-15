import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  usernameControl!: FormControl;
  emailControl!: FormControl;
  passwordControl!: FormControl;
  confirmPasswordControl!: FormControl;
  roleControl!: FormControl;

  passwordMismatch: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usernameControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)
    ]);
    this.emailControl = new FormControl('', [
      Validators.required,
      Validators.email
    ]);
    this.passwordControl = new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]);
    this.confirmPasswordControl = new FormControl('', [
      Validators.required
    ]);
    this.roleControl = new FormControl('', [
      Validators.required
    ]);

    this.signupForm = new FormGroup({
      username: this.usernameControl,
      email: this.emailControl,
      password: this.passwordControl,
      confirmPassword: this.confirmPasswordControl,
      role: this.roleControl
    });
  }

  checkSignup(): void {
    if (this.signupForm.invalid) return;

    this.passwordMismatch = this.passwordControl.value !== this.confirmPasswordControl.value;
    if (this.passwordMismatch) return;

    this.errorMessage = '';
    this.successMessage = '';

    const { username, email, password, role } = this.signupForm.value;

    this.authService.register(username, email, password, role).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully! You can now log in.';
        this.signupForm.reset();
        this.passwordMismatch = false;
      },
      error: () => {
        this.errorMessage = 'Registration failed. Username or email may already be taken.';
      }
    });
  }

  goToLogin(): void {
    this.authService.showSignup = false;
  }
}
