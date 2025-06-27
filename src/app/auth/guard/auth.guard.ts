import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { TokenService } from '../../core/Service/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const _tokenService = inject(TokenService);
  const _route = inject(Router);

  

  if(!_tokenService.isTokenExpired()){

    _route.navigate(['']);
    return false;
  }else{
    _tokenService.removeToken();
  }

  return true;
};
