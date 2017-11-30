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
  showAddProduct: boolean = false;
  showAddCategory: boolean = false;
  private shop: any = {};
  private product: any = {};
  private category: any = {};
  private products: Array<any> = [];
  private selectDate: Array<any> = [];
  private categoryList: Array<any> = [];
  private categoryShopList: Array<any> = [];
  private useSelectDate: Array<any> = [];
  private timeList: Array<any> = [];
  private times: any = {};
  private address: string;
  private latLng: any = {};
  private shopID: string;
  private coverimage: string = '';
  private openTimeString: string = '';

  constructor(private server: ServerConfig, private router: Router, private shopService: ShopService) { }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      }
    });

    this.shopID = window.localStorage.getItem('selectShop');
    this.shop.categories = '';
    this.shopService.getCategoryShop().subscribe(data => {
      this.categoryShopList = data;
    }, err => {
      console.log(err);
    });

    if (this.shopID) {
      this.shopService.getShopByID(this.shopID).subscribe(data => {
        this.shop = data;
        this.address = data.address.address;
        this.latLng = {
          lat: data.address ? data.address.lat : '',
          lng: data.address ? data.address.lng : ''
        };
        this.timeList = data.times;
        this.openTimeString = this.timeList.length > 0 ? this.timeList[0].timestart + '-' + this.timeList[0].timeend : '-';
      }, err => {
        console.log(err);
      });

      this.shopService.getProductsByID(this.shopID).subscribe(data => {
        this.products = data.items;
      }, err => {
        console.log(err);
      });

      this.shopService.getCategoryByID(this.shopID).subscribe(data => {
        this.categoryList = data.items;
        this.product.categories = this.categoryList.length > 0 ? this.categoryList[0]._id : '';
      }, err => {
        console.log(err);
      });
    }
  }

  createProduct() {
    this.showeMainShop = false;
    this.showAddProduct = true;
  }

  createCategory() {
    this.showeMainShop = false;
    this.showAddCategory = true;
  }

  saveCategory() {
    this.category.shop = this.shopID;
    this.category.image = 'http://www.terminal21.co.th/asok/uploaded/content/FujiLogo.jpg';
    this.shopService.saveCategory(this.category).subscribe(data => {
      console.log(data);
      this.showeMainShop = true;
      this.showAddCategory = false;
      location.reload();
    }, err => {
      console.log(err);
    });
  }

  saveProduct() {
    this.product.shop = this.shopID;
    this.product.images = ['http://www.terminal21.co.th/asok/uploaded/content/FujiLogo.jpg'];
    this.shopService.saveProduct(this.product).subscribe(data => {
      console.log(data);
      this.showeMainShop = true;
      this.showAddProduct = false;
      location.reload();
    }, err => {
      console.log(err);
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

        let geocoder = new google.maps.Geocoder();
        geocoder.geocode
          ({
            latLng: places[0].geometry.location
          },
          function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              window.localStorage.setItem('address', results[0].formatted_address);
              window.localStorage.setItem('latLng', JSON.stringify(places[0].geometry.location));
            }
            else {
              console.log(status);
            }
          }
          );

        google.maps.event.addListener(marker, 'dragend', function () {
          let geocoder = new google.maps.Geocoder();
          geocoder.geocode
            ({
              latLng: marker.getPosition()
            },
            function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                window.localStorage.setItem('address', results[0].formatted_address);
                window.localStorage.setItem('latLng', JSON.stringify(marker.getPosition()));
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
    if (this.shopID) {
      this.shop.address = {
        address: this.address,
        lat: this.latLng.lat,
        lng: this.latLng.lng
      };
      this.shop.times = this.timeList;
      this.shop.coverimage = 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=889&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D';
      this.shopService.edit(this.shop).subscribe(data => {
        console.log(data);
        this.showeMainShop = true;
        this.showeditdiv = false;
        this.showeditTime = false;
        this.router.navigate(['/manage-shop']);
      }, err => {
        console.log(err);
      });
    } else {
      this.shop.address = {
        address: this.address,
        lat: this.latLng.lat,
        lng: this.latLng.lng
      };
      this.shop.times = this.timeList;
      this.shop.coverimage = 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=889&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D';

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

  }

  saveMap() {
    this.address = window.localStorage.getItem('address');
    let latLng = JSON.parse(window.localStorage.getItem('latLng'));
    this.latLng = {
      lat: latLng.lat,
      lng: latLng.lng
    };
    this.showeditdiv = true;
    this.showeMap = false;
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
