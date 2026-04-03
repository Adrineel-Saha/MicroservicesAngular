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

const routes: Routes = [
  {path: 'createUser', component: CreateUserComponent},
  {path: 'createProduct', component: CreateProductComponent},
  {path: 'createOrder', component: CreateOrderComponent},
  {path: 'createOrderItem', component: CreateOrderItemComponent},
  {path: 'listUsers', component: ListUsersComponent},
  {path: 'listProductsByName', component: ListProductsByNameComponent},
  {path: 'listOrdersByUser', component: ListOrdersByUserComponent},
  {path: 'listItemsByProduct', component: ListItemsByProductComponent},
  {path: 'updateUser', component: UpdateUserComponent},
  {path: 'updateProduct', component: UpdateProductComponent},
  {path: 'updateOrder', component: UpdateOrderComponent},
  {path: 'updateOrderItem', component: UpdateOrderItemComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
