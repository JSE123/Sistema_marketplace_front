import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { LoginRequest } from '../LoginRequest';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  registroRequest: LoginRequest = {username: '', password: '', roleRequest: {roleListName: ["USER"]}}; 

  constructor(
    private router: Router,
    private _authService: AuthService
  ) {

    this.registerForm = new FormGroup({
      // username: new FormControl('', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z0-9]+$/)]),
      username: new FormControl('', [Validators.required, Validators.minLength(4)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      // password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]),
      confirmPassword: new FormControl ('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue)

    }, this.passwordMatchValidator);

  }
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): {[key: string]: any} | null =>{
    const FormGroup = control as FormGroup;
    const password = FormGroup.get('password')?.value;
    const confirmPassword = FormGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true}
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }


  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this._authService.register(this.registroRequest).subscribe({
      next: (response) => {
        console.log("response: ",response)
        if(response.status){
          this.router.navigate(['/login']);
        }else{
          alert("Error al registrar el usuario");
        }
      },
      error: (error) => {
        // console.log("error: ",error.status)
        if(error.status == 409){
          this.registerForm.get('username')?.setErrors({ usernameExists: true });
        }
        else {
          alert("Ocurrió un error inesperado. Por favor intenta nuevamente.");
        }
        console.error('Error during registration:', error);
        this.loading = false;
      }
    })
    
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
    const confirmPasswordField = document.getElementById('confirmPassword') as HTMLInputElement;
    if (confirmPasswordField) {
      confirmPasswordField.type = this.showConfirmPassword ? 'text' : 'password';
    }
  }
}
