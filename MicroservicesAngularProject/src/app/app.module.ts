import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NavigationComponent } from './components/navigation/navigation.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { CreateOrderComponent } from './components/create-order/create-order.component';
import { CreateOrderItemComponent } from './components/create-order-item/create-order-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ListUsersComponent } from './components/list-users/list-users.component';
import { ListProductsByNameComponent } from './components/list-products-by-name/list-products-by-name.component';
import { ListOrdersByUserComponent } from './components/list-orders-by-user/list-orders-by-user.component';
import { ListItemsByProductComponent } from './components/list-items-by-product/list-items-by-product.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { UpdateOrderComponent } from './components/update-order/update-order.component';
import { UpdateOrderItemComponent } from './components/update-order-item/update-order-item.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    CreateProductComponent,
    CreateUserComponent,
    CreateOrderComponent,
    CreateOrderItemComponent,
    ListUsersComponent,
    ListProductsByNameComponent,
    ListOrdersByUserComponent,
    ListItemsByProductComponent,
    UpdateUserComponent,
    UpdateProductComponent,
    UpdateOrderComponent,
    UpdateOrderItemComponent,
    DeleteUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
