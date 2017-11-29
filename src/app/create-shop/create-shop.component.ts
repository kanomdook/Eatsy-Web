import { Component, OnInit } from '@angular/core';
import { ShopService } from 'app/create-shop/create-shop.service';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-shop',
  templateUrl: './create-shop.component.html',
  styleUrls: ['./create-shop.component.css']
})
export class CreateShopComponent implements OnInit {
  showeMainShop: boolean = true;
  showeditdiv: boolean = false;
  showeditTime: boolean = false;
  private shop: any = {};
  private selectDate: Array<any> = [];
  private useSelectDate: Array<any> = [];
  private timeList: Array<any> = [];
  private times: any = {};

  constructor(private server: ServerConfig, private router: Router, private shopService: ShopService) { }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      }
    });
  }

  selectDay(day) {
    if (this.selectDate[day]) {
      this.selectDate[day] = false;
    } else {
      this.selectDate[day] = true;
    }
  }

  openEditShopDetail() {
    this.showeMainShop = false;
    this.showeditdiv = true;
    this.showeditTime = false;
  }

  save() {
    this.shop.address = {
      address: 'สีลม'
    };
    this.shopService.save(this.shop).subscribe(data => {
      console.log(data);
      this.showeMainShop = true;
      this.showeditdiv = false;
      this.showeditTime = false;
      this.router.navigate(['/manage-shop']);
    }, err => {
      console.log(err);
    });
  }

  openTime() {
    this.showeMainShop = false;
    this.showeditdiv = false;
    this.showeditTime = true;
  }

  saveTime() {
    this.showeMainShop = false;
    this.showeditdiv = true;
    this.showeditTime = false;
    let day: any = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    this.useSelectDate = [];
    this.selectDate.forEach((el, i) => {
      if (el) {
        this.useSelectDate.push(day[i]);
      }
    });
    console.log(this.useSelectDate);

  }

}
