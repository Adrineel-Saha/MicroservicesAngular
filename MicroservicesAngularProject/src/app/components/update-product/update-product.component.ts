import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit {
  product:Product=new Product();
  productId!: number;

  showFormInitial=false;
  showForm=false;
  submitted=false;

  isProductIdAbsent=false;

  productIdForm!: FormGroup;
  updateProductForm!: FormGroup;

  productIdControlOne!: FormControl;
  
  productIdControlTwo!: FormControl;
  productNameControl!: FormControl;
  descriptionControl!: FormControl;
  priceControl!: FormControl;
  stockControl!: FormControl;

  constructor(private productService:ProductService){}

  ngOnInit(){
      this.product=new Product();
  
      this.showFormInitial=false;
      this.showForm=false;
      this.submitted=false;
  
      this.isProductIdAbsent=false;
  
      this.productIdControlOne=new FormControl('',[Validators.required, Validators.min(1)]);
  
      this.productIdControlTwo=new FormControl('',[Validators.required, Validators.min(1)]);
      this.productNameControl=new FormControl('',[Validators.required]);
      this.descriptionControl=new FormControl('',[Validators.required]);
      this.priceControl=new FormControl('',[Validators.required, Validators.min(1)]);
      this.stockControl=new FormControl('',[Validators.required, Validators.min(0)]);
  
      this.productIdForm=new FormGroup({
        productId: this.productIdControlOne
      });
  
      this.updateProductForm=new FormGroup({
        id: this.productIdControlTwo,
        name: this.productNameControl,
        description: this.descriptionControl,
        price: this.priceControl,
        stock: this.stockControl
      });
    }

    onUpdate(){
      this.productId=this.productIdForm.get('productId')?.value;
      this.productService.getProduct(this.productId).subscribe(
        data=>{
          this.product=data;
          this.updateProductForm.patchValue(this.product);
          this.showFormInitial=true
          this.productIdForm.reset();
        }, error=>{
          if(error.status === 404){
            this.isProductIdAbsent=true;
            setTimeout(()=>{
              this.productIdForm.reset();
              this.isProductIdAbsent=false;
            },2000)
          }else{
            console.log(error);
          }   
      })
    }
  
    onSubmit(){
      this.product=this.updateProductForm.getRawValue();
      this.productService.updateProduct(this.productId,this.product).subscribe(
        data=>{
          console.log(data);
          this.showForm=true;
          this.submitted=true;
          this.updateProductForm.reset();
        },error=>{
            console.log(error);
        }
      )
    }

}
