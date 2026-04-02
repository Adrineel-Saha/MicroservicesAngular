import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-list-products-by-name',
  templateUrl: './list-products-by-name.component.html',
  styleUrls: ['./list-products-by-name.component.css']
})
export class ListProductsByNameComponent implements OnInit{
  products!: Product[];
  productName!:string;
  
  submitted=false;
  isProductNameAbsent=false;

  productNameForm!: FormGroup;
  productNameControl!: FormControl;
  
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.submitted=false;
    this.isProductNameAbsent=false;

    this.productNameControl=new FormControl('',[Validators.required]);

    this.productNameForm=new FormGroup({
      productName: this.productNameControl
    });
  };

  onSubmit(){
    // console.log("ProductName "+this.productNameForm.value);
    this.productName=this.productNameForm.get('productName')?.value;
    // console.log("ProductName "+this.productName);

    this.productService.getProductsByName(this.productName)
    .subscribe( data => {
      this.products = data;
      this.submitted=true;
      this.productNameForm.reset();
    }, error=>{
      if(error.status === 404){
        this.isProductNameAbsent=true;
        setTimeout(()=>{
          this.productNameForm.reset();
          this.isProductNameAbsent=false;
        },2000)
      }else{
        console.log(error);
      }  
    });
  }
}
