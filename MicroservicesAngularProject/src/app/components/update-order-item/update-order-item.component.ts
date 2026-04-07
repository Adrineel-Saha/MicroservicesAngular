import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderItem } from 'src/app/models/order-item';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-update-order-item',
  templateUrl: './update-order-item.component.html',
  styleUrls: ['./update-order-item.component.css']
})
export class UpdateOrderItemComponent implements OnInit{
  item:OrderItem=new OrderItem();
  itemId!: number;

  showFormInitial=false;
  showForm=false;
  submitted=false;

  isItemAbsent=false;

  itemIdForm!: FormGroup;
  updateOrderItemForm!: FormGroup;

  itemIdControlOne!: FormControl;
  
  itemIdControlTwo!: FormControl;
  productIdControl!: FormControl;
  quantityControl!: FormControl;
  orderIdControl!: FormControl;
  productNameControl!: FormControl;
  descriptionControl!: FormControl;
  priceControl!: FormControl;
  stockControl!: FormControl;

  constructor(private orderService:OrderService){}

  ngOnInit(){
    this.item=new OrderItem();

    this.showFormInitial=false;
    this.showForm=false;
    this.submitted=false;

    this.isItemAbsent=false;

    this.itemIdControlOne=new FormControl('',[Validators.required, Validators.min(1)]);

    this.itemIdControlTwo=new FormControl('',[Validators.required, Validators.min(1)]);
    this.productIdControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.quantityControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.orderIdControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.productNameControl=new FormControl('',[Validators.required]);
    this.descriptionControl=new FormControl('',[Validators.required]);
    this.priceControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.stockControl=new FormControl('',[Validators.required, Validators.min(0)]);

    this.itemIdForm=new FormGroup({
      itemId: this.itemIdControlOne
    })

    this.updateOrderItemForm=new FormGroup({
      id: this.itemIdControlTwo,
      productId: this.productIdControl,
      quantity: this.quantityControl,
      price: this.priceControl,
      orderId: this.orderIdControl,
      name: this.productNameControl,
      description: this.descriptionControl,
      stock: this.stockControl
    })
  }

  onUpdate(){
    this.itemId=this.itemIdForm.get('itemId')?.value;
    console.log("Item_Id"+this.itemId);
    this.orderService.getItem(this.itemId).subscribe(
      data=>{
        this.item=data;
        this.updateOrderItemForm.patchValue(this.item);
        this.showFormInitial=true;
        this.itemIdForm.reset();
      },error=>{
        if(error.status === 404){
          this.isItemAbsent=true;
          setTimeout(()=>{
            this.itemIdForm.reset();
            this.isItemAbsent=false;
          },2000)
        }else{
          console.log(error);
        }   
      }
    )
  }

  onSubmit(){
    this.item=this.updateOrderItemForm.getRawValue();
    this.orderService.updateItem(this.itemId,this.item).subscribe(data=>{
      console.log(data);
          this.showForm=true;
          this.submitted=true;
          this.updateOrderItemForm.reset();
    }, error=>{
      console.log(error);
    })
  }
}
