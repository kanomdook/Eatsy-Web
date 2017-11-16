import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { FacebookService, InitParams } from 'ngx-facebook';
import { error } from 'util';
import { forEach } from '@angular/router/src/utils/collection';
import { element } from 'protractor';
import { resolve } from 'dns';
import { reject } from 'q';

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
  private shops: Array<any> = [];
  private local: string;
  private shopType: string;
  private keyword: string;
  private latLng: any = {
    lat: 13.7466532,
    lng: 100.5347222
  }; //central world
  private customSearch: boolean = false;

  constructor(private fb: FacebookService, public modal: Modal) {
    let initParams: InitParams = {
      appId: '618352801888304',
      xfbml: true,
      version: 'v2.10'
    };
    fb.init(initParams);
  }

  ngOnInit() {
    this.fb.login({
      enable_profile_selector: true,
      return_scopes: true,
      scope: 'public_profile,user_friends,email,pages_show_list'
    }).then(data => {

    }).catch(err => {
      console.log(err);
    });
  }

  saveShops() {
    console.log(this.shops);
  }

  convertLocalToGeo() {
    return new Promise((resolve, reject) => {
      resolve(true);
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
      zoom: 15,
      center: this.latLng
    });

    if (!this.customSearch) {
      this.local = 'สยามพารากอน';
      this.keyword = 'ก๋วยเตี๋ยว';
      this.shopType = '';
    }

    let request = {
      location: this.latLng,
      radius: '50000',
      types: [this.shopType],
      keyword: this.keyword
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status == 'OK') {
        results.forEach((element, i) => {
          element.id = element.place_id;
          element.img = element.photos ? element.photos[0].getUrl({ 'maxWidth': 318, 'maxHeight': 180 }) : 'http://www.freeiconspng.com/uploads/no-image-icon-15.png';
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

    this.fb.api('/search?center=' + this.latLng.lat + ',' + this.latLng.lng + '&distance=50000&q=' + this.keyword + '&type=' + this.shopType, 'get').then(stores => {
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
        this.shopList.push(shopNewScema);
      }).catch(err2 => {
        console.log(err2);
      });
    });

    this.customSearch = false;    
  }

}
