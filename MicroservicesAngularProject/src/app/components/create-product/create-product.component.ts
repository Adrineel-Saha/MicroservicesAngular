import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit{
  submitted=false;
  product:Product=new Product();

  productForm!: FormGroup;
  
  productNameControl!: FormControl;
  descriptionControl!: FormControl;
  priceControl!: FormControl;
  stockControl!: FormControl;

  constructor(private productService:ProductService){}

  ngOnInit(){
    this.submitted=false;
    this.product=new Product();

    this.productNameControl=new FormControl('',[Validators.required]);
    this.descriptionControl=new FormControl('',[Validators.required]);
    this.priceControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.stockControl=new FormControl('',[Validators.required, Validators.min(0)]);

    this.productForm=new FormGroup({
      name: this.productNameControl,
      description: this.descriptionControl,
      price: this.priceControl,
      stock: this.stockControl
    });
  }

  onSubmit(){
    this.product=this.productForm.value;

    this.productService.createProduct(this.product).subscribe(
      response=>{
        console.log(response.body);
        this.submitted=true;
        this.productForm.reset();
    },error=>{
      console.log(error);
    })       
  }
}
