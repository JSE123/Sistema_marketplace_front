import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddProductComponent } from './products/product-form/add-product/add-product.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { MyProductsComponent } from './products/my-products/my-products.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './auth/guard/auth.guard';
import { loginGuard } from './Guard/login.guard';
import { ManageCategoriesComponent } from './Pages/manage-categories/manage-categories.component';
import { ManageUsersComponent } from './Pages/manage-users/manage-users.component';
import { ProductComponent } from './products/product/product.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent, canActivate: [authGuard]}, 
    {path: '', component: HomeComponent},
    {path: 'sign-up', component: RegisterComponent, canActivate: [authGuard]},
    {path: 'post', component: AddProductComponent, canActivate: [loginGuard]},
    {path: 'product/:id', component: ProductDetailsComponent, canActivate: [loginGuard]},
    {path: 'my-products', component: MyProductsComponent, canActivate: [loginGuard]},
    {path: 'profile', component: ProfileComponent, canActivate: [loginGuard]},
    {path: 'edit-product/:id', component: AddProductComponent, canActivate: [loginGuard]},
    {path: 'category', component: ManageCategoriesComponent, canActivate: [loginGuard]},
    {path: 'users', component: ManageUsersComponent, canActivate: [loginGuard]},
    {path: 'products', component: ProductComponent},
    {path: '**', redirectTo: '/', pathMatch: 'full'}


];
