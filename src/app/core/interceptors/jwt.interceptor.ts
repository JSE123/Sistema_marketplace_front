import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../auth/service/auth.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const _authService = inject(AuthService);
  const token = _authService.getToken();

  if(token){
    // console.log("token desde interceptor", token);
    const clonedRequest = request.clone({
    setHeaders:{
      Authorization: `Bearer ${_authService.getToken()}`
    },
    });
    return next(clonedRequest);
  }
  return next(request);
};
