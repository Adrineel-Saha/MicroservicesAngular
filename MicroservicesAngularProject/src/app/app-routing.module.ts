import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { CreateOrderComponent } from './components/create-order/create-order.component';
import { CreateOrderItemComponent } from './components/create-order-item/create-order-item.component';
import { ListUsersComponent } from './components/list-users/list-users.component';
import { ListProductsByNameComponent } from './components/list-products-by-name/list-products-by-name.component';
import { ListOrdersByUserComponent } from './components/list-orders-by-user/list-orders-by-user.component';
import { ListItemsByProductComponent } from './components/list-items-by-product/list-items-by-product.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { UpdateOrderComponent } from './components/update-order/update-order.component';
import { UpdateOrderItemComponent } from './components/update-order-item/update-order-item.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthGuardAdminService } from './services/auth-guard-admin.service';
import { AuthGuardUserService } from './services/auth-guard-user.service';

const routes: Routes = [
  // ADMIN only — user management
  {path: 'createUser', component: CreateUserComponent, canActivate: [AuthGuardAdminService]},
  {path: 'listUsers', component: ListUsersComponent, canActivate: [AuthGuardAdminService]},
  {path: 'updateUser', component: UpdateUserComponent, canActivate: [AuthGuardAdminService]},
  {path: 'deleteUser', component: DeleteUserComponent, canActivate: [AuthGuardAdminService]},

  // ADMIN, MODERATOR, USER only — order management (GUEST not allowed)
  {path: 'createOrder', component: CreateOrderComponent, canActivate: [AuthGuardUserService]},
  {path: 'createOrderItem', component: CreateOrderItemComponent, canActivate: [AuthGuardUserService]},
  {path: 'listOrdersByUser', component: ListOrdersByUserComponent, canActivate: [AuthGuardUserService]},
  {path: 'updateOrder', component: UpdateOrderComponent, canActivate: [AuthGuardUserService]},
  {path: 'updateOrderItem', component: UpdateOrderItemComponent, canActivate: [AuthGuardUserService]},

  // All logged-in users including GUEST — product management
  {path: 'createProduct', component: CreateProductComponent, canActivate: [AuthGuardService]},
  {path: 'listProductsByName', component: ListProductsByNameComponent, canActivate: [AuthGuardService]},
  {path: 'listItemsByProduct', component: ListItemsByProductComponent, canActivate: [AuthGuardService]},
  {path: 'updateProduct', component: UpdateProductComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
