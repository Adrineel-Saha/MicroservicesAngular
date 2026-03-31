import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { CreateOrderComponent } from './components/create-order/create-order.component';
import { CreateOrderItemComponent } from './components/create-order-item/create-order-item.component';

const routes: Routes = [
  {path: 'createUser', component: CreateUserComponent},
  {path: 'createProduct', component: CreateProductComponent},
  {path: 'createOrder', component: CreateOrderComponent},
  {path: 'createOrderItem', component: CreateOrderItemComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
