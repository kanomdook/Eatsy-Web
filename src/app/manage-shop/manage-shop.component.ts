import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { FacebookService, InitParams } from 'ngx-facebook';
import { error } from 'util';
import { forEach } from '@angular/router/src/utils/collection';
import { element } from 'protractor';

declare var google;

@Component({
  selector: 'app-manage-shop',
  templateUrl: './manage-shop.component.html',
  styleUrls: ['./manage-shop.component.css']
})
export class ManageShopComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef;

  private shopList: Array<any> = [];
  constructor(private fb: FacebookService, public modal: Modal) {
    let initParams: InitParams = {
      appId: '618352801888304',
      xfbml: true,
      version: 'v2.10'
    };

    fb.init(initParams);
  }

  ngOnInit() {
    let latLng = {
      lat: 13.7466532,
      lng: 100.5347222
    };

    let map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 15,
      center: latLng
    });

    let request = {
      location: latLng,
      radius: '50000',
      types: ["cafe", "restaurant", "food", "store"],
      keyword: 'coffee'
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status == 'OK') {

        results.forEach(element => {
          element.img = element.photos ? element.photos[0].getUrl({ 'maxWidth': 318, 'maxHeight': 180 }) : 'http://www.freeiconspng.com/uploads/no-image-icon-15.png';
        });

        this.shopList = results;
        console.log('===========================Shop From GoogleMap==========');
        
        console.log(this.shopList);

        console.log('=======================================================');
        console.log('===========================Shop From Facebook==========');
        this.fb.login({
          enable_profile_selector: true,
          return_scopes: true,
          scope: 'public_profile,user_friends,email,pages_show_list'
        }).then(data => {
          this.fb.api('/search?center=13.7464667,100.5318305&distance=50000&q=coffee&type=place', 'get').then(stores => {
            this.dataStore(stores.data);
          }).catch(error => {
            console.log(error);
          });
        }).catch(err => {
          console.log(err);
        });        
      }
    });

  }

  dataStore(stores: Array<any>) {
    stores.forEach(element => {
      this.fb.api('/' + element.id + '?fields=photos{images},name,category', 'get').then(storeData => {
        console.log(storeData);
      }).catch(err2 => {
        console.log(err2);
      });
    });
  }

}
