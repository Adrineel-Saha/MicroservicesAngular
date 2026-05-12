import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit{
  user:User=new User();
  userId!: number;

  showFormInitial=false;
  showForm=false;
  submitted=false;

  isUserIdAbsent=false;
  isEmailExists=false;

  userIdForm!: FormGroup;
  updateUserForm!: FormGroup;

  userIdControlOne!: FormControl;
  userIdControlTwo!: FormControl;
  userNameControl!: FormControl;
  emailControl!: FormControl;

  constructor(private userService:UserService){}

  ngOnInit(){
    this.user=new User();

    this.showFormInitial=false;
    this.showForm=false;
    this.submitted=false;

    this.isUserIdAbsent=false;
    this.isEmailExists=false;

    this.userIdControlOne=new FormControl('',[Validators.required, Validators.min(1)]);

    this.userIdControlTwo=new FormControl('',[Validators.required, Validators.min(1)]);
    this.userNameControl=new FormControl('',[Validators.required,Validators.minLength(3),Validators.maxLength(50)]);
    this.emailControl=new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);

    this.userIdForm=new FormGroup({
      userId: this.userIdControlOne
    });

    this.updateUserForm=new FormGroup({
      id: this.userIdControlTwo,
      userName: this.userNameControl,
      email: this.emailControl
    });
  }

  onUpdate(){
    this.userId=this.userIdForm.get('userId')?.value;
    this.userService.getUser(this.userId).subscribe(
      response=>{
        this.user=response.body ?? new User();
        this.updateUserForm.patchValue(this.user);
        this.showFormInitial=true
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
    })
  }

  onSubmit(){
    this.user=this.updateUserForm.getRawValue();
    this.userService.updateUser(this.userId,this.user).subscribe(
      response=>{
        console.log(response.body);
        this.showForm=true;
        this.submitted=true;
        this.updateUserForm.reset();
      },error=>{
        if(error.status === 400 && error.error === 'User Already Exists with Email Id: '+this.user.email){
          this.isEmailExists=true;
          setTimeout(()=>{
            this.updateUserForm.get('email')?.reset();
            this.isEmailExists=false;
          },2000)
        }else{
          console.log(error);
        }
      }
    )
  }

}
