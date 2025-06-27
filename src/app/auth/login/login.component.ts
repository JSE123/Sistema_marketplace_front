import { Component, inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { LoginRequest } from '../LoginRequest';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../core/Service/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,  RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  loginRequest: LoginRequest = {username: "", password: ""};
  form: FormGroup;

  private _tokenService = inject(TokenService);//dependencia de tokenService
  

  submitted = false;
  loading = false;
  showPassword = false;

  constructor(private fb: FormBuilder) {
    this.form = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    //Verificar si existe un token y redirigir al usuario a la página principal si ya está autenticado
    // if (this._tokenService.existsToken()) {
    //   this._router.navigate(['']);
    // }
  }
  get f() { return this.form.controls; }
  onSubmit() {
    this.submitted = true;



    if (this.form.valid) {
      this._authService.login(this.form.value).subscribe({
        next: response => {
          console.log("respuesta", response);
          if(response.status){
            this._router.navigate([''])
          }else{
            console.log("Usuario o contraseña incorrecta")
          }
        },
        error: (err) => {
          if(err.status == 401){
            console.log("Usuario o contraseña incorrecta")
            this.form.get('username')?.setErrors({ incorrect: true });
            this.form.get('password')?.setErrors({ incorrect: true });
          }
        },
      });
    }else{
      return;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }
}
