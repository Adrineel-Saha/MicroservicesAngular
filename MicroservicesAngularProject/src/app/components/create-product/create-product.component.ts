import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit{
  submitted=false;

  productForm!: FormGroup;
  
  productNameControl!: FormControl;
  descriptionControl!: FormControl;
  priceControl!: FormControl;
  stockControl!: FormControl;

  constructor(){}

  ngOnInit(){
    this.submitted=false;

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
      // console.log("Submitted"+this.submitted);
      this.submitted=true;
      // console.log("Submitted"+this.submitted);
      // alert("Form Submitted");
  }
}
