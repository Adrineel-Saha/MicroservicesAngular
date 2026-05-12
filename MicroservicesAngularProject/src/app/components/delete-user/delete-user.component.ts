import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css']
})
export class DeleteUserComponent implements OnInit{
  userId!: number;
  submitted=false;
  isUserIdAbsent=false;
  result!: string;

  userIdForm!: FormGroup;
  
  userIdControl!: FormControl;

  constructor(private userService:UserService){}
  
  ngOnInit(){
    this.submitted=false;

    this.userIdControl=new FormControl('',[Validators.required, Validators.min(1)]);

    this.userIdForm=new FormGroup({
      userId: this.userIdControl
    });
  }

  onSubmit(){
    this.userId=this.userIdForm.get('userId')?.value;

    this.userService.deleteUser(this.userId).subscribe(
      response=>{
        console.log(response.body);
        this.result=response.body ?? '';
        this.submitted=true;
        this.userIdForm.reset();
      }, error=>{
        if(error.status === 404){
          this.isUserIdAbsent=true;
          setTimeout(()=>{
            this.userIdForm.reset();
            this.isUserIdAbsent=false;
          },2000)
        }else{
          console.log(error);
        }   
      }
    )
  }
}
