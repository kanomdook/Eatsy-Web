import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { FacebookService, InitParams } from 'ngx-facebook';
import { error } from 'util';
import { forEach } from '@angular/router/src/utils/collection';
import { element } from 'protractor';
import { resolve } from 'dns';
import { reject } from 'q';
import { ManageShopService } from 'app/manage-shop/manage-shop.service';
import { Router } from '@angular/router';
import { ServerConfig } from 'app/provider/server.config';
import { ShopService } from 'app/create-shop/create-shop.service';

declare var google;

@Component({
  selector: 'app-manage-shop',
  templateUrl: './manage-shop.component.html',
  styleUrls: ['./manage-shop.component.css']
})
export class ManageShopComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  private shopList: Array<any> = [];
  private importForm: string;
  private selectedShop: Array<any> = [];
  private loadingIdx: Array<any> = [];
  private shops: Array<any> = [];
  private local: string;
  private shopType: string;
  private keyword: string;
  private action: string;
  private latLng: any = {
    lat: 13.7466532,
    lng: 100.5347222
  }; //central world
  private customSearch: boolean = false;
  private shopTableList: Array<any> = [];
  private shopTableListNew: Array<any> = [];
  private shopForEdit: any = {};
  private shopsL: Array<any> = [];
  menuItems: any[];
  selectedTab: number = 0;
  constructor(public shopService: ShopService, private server: ServerConfig, private router: Router, private fb: FacebookService, public manageShopService: ManageShopService) {
    let initParams: InitParams = {
      appId: '618352801888304',
      xfbml: true,
      version: 'v2.10'
    };
    fb.init(initParams);
    this.fb.login({
      enable_profile_selector: true,
      return_scopes: true,
      scope: 'public_profile,user_friends,email,pages_show_list'
    }).then(data => {

    }).catch(err => {
      console.log(err);
    });
    this.ngOnInit();
  }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      } else {
        // this.manageShopService.getLocalJSONshoplist().subscribe(jso => {
        //   this.shopsL = jso;
        //   console.log("JSON : ", this.shopsL);
        // });
        this.manageShopService.getListShop().subscribe(data => {
          this.shopsL = data;
        });

        // this.manageShopService.getList().subscribe(data => {
        //   this.shopTableList = data;
        //   console.log(this.shopTableList);
        // }, err => {
        //   console.log(err);
        // });

        // this.manageShopService.getListNewShop().subscribe(data => {
        //   this.shopTableListNew = data;
        //   console.log(this.shopTableListNew);
        // }, err => {
        //   console.log(err);
        // });
      }

    });
  }

  saveShops() {

    console.log(this.shops);
    this.shops.forEach((element, i) => {
      if (!this.loadingIdx[element.id] && !this.selectedShop[element.id]) {

      } else {
        this.loadingIdx[element.id] = true;
        this.selectedShop[element.id] = true;
      }

      element.address = {
        address: element.vicinity,
        lat: element.lat,
        lng: element.lng
      };
      element.tel = element.phone;
      element.coverimage = element.img;
      element.importform = this.importForm;
      this.manageShopService.save(element).subscribe(dataRes => {
        this.loadingIdx[element.id] = false;
        if (this.shops.length === i + 1) {
          location.reload();
        }
        // this.selectedShop[element.id] = false;            
        console.log(dataRes);
      }, err => {
        this.loadingIdx[element.id] = false;
        console.log(err);
        if (JSON.parse(err._body).message.toString() === 'Name already exists') {
          alert("มีข้อมูลร้าน " + element.name + "แล้วค่ะ");
        }
        this.selectedShop[element.id] = false;
      });
    });
  }

  deleteShop(shopID) {
    this.shopService.delete(shopID).subscribe(data => {
      console.log(data);
      location.reload();
    }, err => {
      console.log(err);
    });
  }

  createShop() {
    window.localStorage.removeItem('selectShop');
    this.router.navigate(['/create-shop']);
  }

  editShop(shop) {
    window.localStorage.setItem('selectShop', shop._id);
    this.router.navigate(['/create-shop']);
  }

  convertLocalToGeo() {
    return new Promise((resolve, reject) => {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': this.local }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          this.latLng = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          console.log(this.latLng);
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  }

  search() {
    this.customSearch = true;
    if (this.importForm == 'Google') {
      this.convertLocalToGeo().then(data => {
        this.getShopFromGoogle();
      }).catch(err => {
        console.log(err);
      });
    } else if (this.importForm == 'Facebook') {
      this.convertLocalToGeo().then(data => {
        this.getShopFromFacebook();
      }).catch(err => {
        console.log(err);
      });
    }
  }

  selectShops(id) {
    if (this.selectedShop[id]) {
      this.selectedShop[id] = false;
      this.processSelectShop(id);
    } else {
      this.selectedShop[id] = true;
      this.processSelectShop(id);
    }
  }

  processSelectShop(id) {
    let checkDup: number = this.shops.findIndex(i => i.id === id);
    this.shopList.forEach(element => {
      if (element.id == id) {
        if (checkDup == -1) {
          this.shops.push(element);
        } else {
          this.shops.splice(checkDup, 1);
        }
      }
    });
  }

  getShopFromGoogle() {
    this.importForm = 'Google';
    this.shops = [];
    this.selectedShop = [];
    this.shopList = [];

    let map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 18
    });

    if (!this.customSearch) {
      this.local = 'สยามพารากอน';
      this.keyword = 'ก๋วยเตี๋ยว';
      this.shopType = '';
    }

    let request = {
      location: this.latLng,
      radius: '2000',
      types: [this.shopType],
      keyword: this.keyword
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status == 'OK') {
        results.forEach((element, i) => {
          element.id = element.place_id;
          element.img = element.photos ? element.photos[0].getUrl({ 'maxWidth': 318, 'maxHeight': 180 }) : 'http://www.freeiconspng.com/uploads/no-image-icon-15.png';
          element.lat = element.geometry.location.lat();
          element.lng = element.geometry.location.lng();
          let request2 = {
            placeId: element.place_id
          };

          setTimeout(() => {
            service.getDetails(request2, (place, status) => {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                element.phone = place.international_phone_number ? place.international_phone_number : '';
              }
            });
          }, 300 * i);
        });

        this.shopList = results;
        this.customSearch = false;
      }
    });
  }

  getShopFromFacebook() {
    this.importForm = 'Facebook';
    this.shopList = [];
    this.shops = [];
    this.selectedShop = [];

    if (!this.customSearch) {
      this.local = 'สยามพารากอน';
      this.keyword = 'ก๋วยเตี๋ยว';
      this.shopType = 'place';
    }

    this.fb.api('/search?center=' + this.latLng.lat + ',' + this.latLng.lng + '&distance=1000&q=' + this.keyword + '&type=' + this.shopType, 'get').then(stores => {
      this.dataStore(stores.data);
    }).catch(error => {
      console.log(error);
    });
  }

  dataStore(stores: Array<any>) {
    stores.forEach(element => {
      this.fb.api('/' + element.id + '?fields=photos{images},name,category,location,phone', 'get').then(storeData => {
        let shopNewScema: any = {};
        shopNewScema.img = storeData.photos ? storeData.photos.data[0].images[0].source : 'http://www.freeiconspng.com/uploads/no-image-icon-15.png';
        shopNewScema.id = storeData.id;
        shopNewScema.name = storeData.name;
        shopNewScema.vicinity = storeData.location.street ? storeData.location.street : '' + storeData.location.city;
        shopNewScema.phone = storeData.phone;
        shopNewScema.lat = storeData.location.latitude;
        shopNewScema.lng = storeData.location.longitude;
        this.shopList.push(shopNewScema);
      }).catch(err2 => {
        console.log(err2);
      });
    });

    this.customSearch = false;
  }
  isSendMail(shopID) {
    console.log('id' + shopID);
    this.manageShopService.sendMail(shopID).subscribe(data => {
      console.log(data);
      location.reload();
    }, err => {
      console.log(err);
    });
  }

  activeChange($event){
   if($event == true){
console.log("ON");
   }else if($event == false){
console.log("OFF");
   }
  }
}
