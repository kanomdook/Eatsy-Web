import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ShopService } from 'app/create-shop/create-shop.service';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
declare let google;
@Component({
  selector: 'app-create-shop',
  templateUrl: './create-shop.component.html',
  styleUrls: ['./create-shop.component.css']
})
export class CreateShopComponent implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('pacinput') pacinput: ElementRef;
  showeMainShop: boolean = true;
  showeditdiv: boolean = false;
  showeditTime: boolean = false;
  showeMap: boolean = false;
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

  openSelectMap() {
    this.showeditdiv = false;
    this.showeMap = true;

    setTimeout(() => {
      let map = new google.maps.Map(this.mapElement.nativeElement, {
        center: { lat: 13.7274116, lng: 100.5397122 },
        zoom: 18,
        mapTypeId: 'roadmap'
      });

      let input = this.pacinput.nativeElement;
      let searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener('places_changed', function () {
        let places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        let marker = new google.maps.Marker({
          map: map,
          title: places[0].name,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: places[0].geometry.location
        });
        marker.addListener('click', function () {
          alert(places[0].name);
        });

        google.maps.event.addListener(marker, 'dragend', function () {
          let geocoder = new google.maps.Geocoder();
          geocoder.geocode
            ({
              latLng: marker.getPosition()
            },
            function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                console.log(results[0].formatted_address);
              }
              else {
                console.log(status);
              }
            }
            );
        });
        let bounds = new google.maps.LatLngBounds();
        bounds.union(places[0].geometry.viewport);
        map.fitBounds(bounds);
      });

    }, 300);
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

    this.selectDate.forEach((el, i) => {
      if (el) {
        this.useSelectDate.push(day[i]);
      }
    });
    this.times.days = this.useSelectDate;
    this.timeList.push(this.times);
    this.times = {};
    this.useSelectDate = [];
    this.selectDate = [];
    console.log(this.timeList);
  }

  deleteTime(id) {
    for (let i = 0; i < this.timeList.length; i++) {
      if (id == i) {
        this.timeList.splice(i, 1);
        break;
      }
    }
  }

}
