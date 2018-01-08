import { Component, OnInit } from '@angular/core';
import { ManageUserService } from 'app/manage-user/manage-user.service';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {
  private listAllUser:Array<any> = [];
  private listCust: Array<any> = [];
  private listShopOwner: Array<any> = [];
  private listAdmin: Array<any> = [];
  private listBiker: Array<any> = [];
  private curentPage: Array<any> = [];
  private pageSelect: number = 0;
  private currentPageSelected: number = 1;
  private editingUserData: Object = {};
  constructor(private UserService: ManageUserService, private server: ServerConfig, private router: Router) {
    this.getAllUser();
   }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      } else {
        // this.getAllUser();
      }
    });
  }

  getAllUser() {
    this.UserService.getUser().subscribe(jso => {
      this.listAllUser = jso.filterrole;
      this.listAllUser.forEach(element => {
        if (element.name == "customer") {
          this.listCust.push(element.users);
        } else if (element.name == "shopowner") {
          this.listShopOwner.push(element.users);
        } else if (element.name == "admin") {
          this.listAdmin.push(element.users);
        } else if (element.name == "biker") {
          this.listBiker.push(element.users);
        }

      });
      // this.listCust =  this.listAllUser.filter({name: 'customer'});
      console.log(this.listCust);
    }, err => {
      let msgERR = JSON.parse(err._body);
      if (msgERR.message == "Token is incorrect or has expired. Please login again") {
        alert("หมดระยะเวลาการเชื่อมต่อกับระบบบริหารร้านค้า \nกรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        window.localStorage.clear();
      }
    })
  }

  editUser(item){
    this.editingUserData = item;
    console.log(item);
  }
}
