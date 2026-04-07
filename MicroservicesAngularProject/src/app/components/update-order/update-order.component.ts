import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.css']
})
export class UpdateOrderComponent implements OnInit{
  order:Order=new Order();
  orderId!: number;

  showFormInitial=false;
  showForm=false;
  submitted=false;

  isOrderAbsent=false;

  orderIdForm!: FormGroup;
  updateOrderStatusForm!: FormGroup;

  orderIdControlOne!: FormControl;
  
  orderIdControlTwo!: FormControl;
  statusControl!: FormControl;
  userIdControl!: FormControl;
  createdAtControl!: FormControl;
  userNameControl!: FormControl;
  emailControl!: FormControl;

  constructor(private orderService:OrderService){}
  
  ngOnInit(){
    this.order=new Order();

    this.showFormInitial=false;
    this.showForm=false;
    this.submitted=false;

    this.isOrderAbsent=false;

    this.orderIdControlOne=new FormControl('',[Validators.required, Validators.min(1)]);

    this.orderIdControlTwo=new FormControl('',[Validators.required, Validators.min(1)]);
    this.userIdControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.statusControl=new FormControl('',[Validators.required, Validators.pattern(/^(CREATED|PAID|SHIPPED|CANCELLED)$/)]);
    this.createdAtControl=new FormControl('',[Validators.required]);
    this.userNameControl=new FormControl('',[Validators.required,Validators.minLength(3),Validators.maxLength(50)]);
    this.emailControl=new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);
    
    this.orderIdForm=new FormGroup({
      orderId: this.orderIdControlOne
    });

    this.updateOrderStatusForm=new FormGroup({
      id: this.orderIdControlTwo,
      userId: this.userIdControl,
      status: this.statusControl,
      createdAt: this.createdAtControl,
      userName: this.userNameControl,
      email: this.emailControl
    })
  }

  onUpdate(){
    this.orderId=this.orderIdForm.get('orderId')?.value;
    this.orderService.getOrder(this.orderId).subscribe(
      data=>{
        this.order=data;
        this.updateOrderStatusForm.patchValue(this.order);
        this.showFormInitial=true;
        this.orderIdForm.reset();
      },error=>{
        if(error.status === 404){
          this.isOrderAbsent=true;
          setTimeout(()=>{
            this.orderIdForm.reset();
            this.isOrderAbsent=false;
          },2000)
        }else{
          console.log(error);
        }   
      }
    )
  }

  onSubmit(){
    this.order=this.updateOrderStatusForm.getRawValue();
    this.orderService.updateOrderStatus(this.orderId,this.order.status).subscribe(data=>{
      console.log(data);
          this.showForm=true;
          this.submitted=true;
          this.updateOrderStatusForm.reset();
    }, error=>{
      console.log(error);
    })
  }
}
