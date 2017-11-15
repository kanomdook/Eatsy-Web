import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
declare var google;

@Component({
  selector: 'app-manage-shop',
  templateUrl: './manage-shop.component.html',
  styleUrls: ['./manage-shop.component.css']
})
export class ManageShopComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef;

  private shopList: Array<any> = [];
  constructor(public modal: Modal) { }

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
        console.log(this.shopList);
      }
    });

  }

}
