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


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    CreateProductComponent,
    CreateUserComponent,
    CreateOrderComponent,
    CreateOrderItemComponent
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
