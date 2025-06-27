import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../core/Service/token.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if(tokenService.isTokenExpired()) {
    router.navigate(['']);
  }
  return true;
};
