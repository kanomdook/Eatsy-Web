import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ShopService } from 'app/create-shop/create-shop.service';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { element } from 'protractor';


declare let google;
declare let $: any;
@Component({
  selector: 'app-create-shop',
  templateUrl: './create-shop.component.html',
  styleUrls: ['./create-shop.component.css']
})
export class CreateShopComponent implements OnInit {
  @ViewChild('modal') modal: ElementRef;
  @ViewChild('modalproduct') modalproduct: ElementRef;

  @ViewChild('shopinfoTab') shopinfo;
  @ViewChild('shopcontactTab') shopcontact;
  @ViewChild('shoptimecloseTab') shoptimeclose;
  @ViewChild('shopaddressTab') shopaddress;


  galleryOptions: Array<NgxGalleryOptions> = [];
  galleryImages: Array<NgxGalleryImage> = [];
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('pacinput') pacinput: ElementRef;
  @ViewChild('fileInput') fileInput;
  @ViewChild('promoteimgInput') promoteimgInput;
  @ViewChild('cateimgInput') cateimgInput;
  @ViewChild('prdimgInput') prdimgInput;
  showeMainShop: boolean = false;
  showeditdiv: boolean = true;
  showeditTime: boolean = false;
  showeMap: boolean = false;
  showAddProduct: boolean = false;
  showAddCategory: boolean = false;
  private shop: any = {};
  private product: any = {};
  private category: any = {};
  private products: Array<any> = [];
  private oldsProducts: Array<any> = [];
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
  private currentGEO: any = { lat: null, lng: null };
  private CE_action_product: string;
  private CE_id_product: string;
  private CE_action_category: string;
  private CE_id_category: string;
  private selectList: Array<any> = [];
  private shopCateSelected: Array<any> = [];
  private checkeds: Array<any> = [];
  private selectedCate: number = 0;
  private selectTabs: number = 0;
  private isEditshopMode: boolean = false;
  private blockInput: boolean = true;
  promoteIsEdit: boolean = false;
  updateOrEditCateImg: any;
  limitPrdImg = 3;
  constructor(private server: ServerConfig, private router: Router, private shopService: ShopService,
    // private modalService: BsModalService
  ) {
    this.galleryOptions = [
      {
        width: '100%',
        height: '65vh',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
        imageSwipe: true,
        // imageInfinityMove: true
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '80vh',
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,
        thumbnailsSwipe: true,
        // thumbnailsRemainingCount: true
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];

  }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      }
    });
    this.getCurrentGeolocation().then((geo) => {
      this.currentGEO = geo;
    })
    this.shopID = window.localStorage.getItem('selectShop');
    if (this.shopID) {
      this.showeMainShop = true;
      this.showeditdiv = false;
      // this.shopCateSelected.forEach(element => this.shopCateSelected[this.shopCateSelected.length]._id = )
    }
    if (!this.shopID) {
      this.blockInput = false;
    }
    this.shop.categories = '';
    this.shopService.getCategoryShop().subscribe(data => {
      this.categoryShopList = data;
      this.InitialData();
    }, err => {
      console.log(err);
    });

  }


  InitialData() {
    if (this.shopID) {
      this.shopService.getShopByID(this.shopID).subscribe(data => {
        this.shop = data;
        data.categories.forEach(element => {
          this.selectList.push(element._id);
        });

        console.log(this.selectList);

        for (let i = 0; i < this.categoryShopList.length; i++) {
          for (let j = 0; j < this.selectList.length; j++) {
            if (this.categoryShopList[i]._id === this.selectList[j]) {
              this.checkeds[this.categoryShopList[i]._id] = true;
            }
          }
        }

        this.shop.categories = data.categories;
        console.log(data.categories);
        let imgs: Array<any> = data.promoteimage;

        imgs.forEach((el, i) => {
          this.galleryImages.push({
            big: el,
            medium: el,
            small: el
          });
        });

        // for (let index = 0; index < this.shop.promoteimage.length; index++) {
        //   this.galleryImages[index].medium = this.shop.promoteimage[index];

        // }
        // this.shop.categories = this.shop.categories ? this.shop.categories._id : '';
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

  uploadCoverImage() {
    this.fileInput.nativeElement.click();
  }
  uploadPromoteImage() {
    this.promoteimgInput.nativeElement.click();
  }
  updateCateImg() {
    this.updateOrEditCateImg = null;
    this.cateimgInput.nativeElement.click();
  }

  onCateImgChange(e, modal) {
    $(this.modal.nativeElement).modal('show');
    this.CE_action_category = 'เพิ่ม';
    const fileBrowser = this.cateimgInput.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (this.shopID) {
      if (fileBrowser.files.length > 0) {
        reader.onload = () => {
          this.category.image = reader.result.replace(/\n/g, '');
          this.shopService.uploadCateImage(this.category.image).subscribe(data => {
            this.updateOrEditCateImg = data.imageURL;
          }, err => {
            console.log(err);
          });
        };
      }
    } else {
      reader.onload = () => {
        this.category.image = reader.result.replace(/\n/g, '');
        this.shopService.uploadCateImage(this.category.image).subscribe(data => {
          this.updateOrEditCateImg = data.imageURL;
        }, err => {
          console.log(err);
        });
      };
    }
  }

  onPromoteImgChange(e) {
    const fileBrowser = this.promoteimgInput.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (this.shopID) {
      if (fileBrowser.files.length > 0) {
        reader.onload = () => {
          let promteImgStr = reader.result.replace(/\n/g, '');
          this.shop.newpromoteimage = promteImgStr;
          this.shopService.uploadPromoteImage(this.shop).subscribe(data => {
            this.shop.promoteimage.push(data.imageURL);
            this.shopService.edit(this.shop).subscribe(shopRes => {
              alert("เพิ่มรูปภาพโปรโมทร้านเรียบร้อยแล้วค่ะ");
              this.galleryImages = [];
              this.InitialData();
            }, err => {
              alert("เกิดข้อผิดพลาดในการเพิ่มรูปภาพโปรโมทร้าน กรุณาลองใหม่อีกครั้งค่ะ");
              console.log(err);
            });
          }, err => {
            console.log(err);
          });
        };
      }
    } else {
      reader.onload = () => {
        let promteImgStr = reader.result.replace(/\n/g, '');
        this.shop.newpromoteimage = promteImgStr;
        this.shopService.uploadPromoteImage(this.shop).subscribe(data => {
          this.shop.promoteimage.push(data.imageURL);
        }, err => {
          console.log(err);
        });
      };
    }
  }

  onCoverChange(e) {
    const fileBrowser = this.fileInput.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (this.shopID) {
      if (fileBrowser.files.length > 0) {
        reader.onload = () => {
          this.shop.coverimage = reader.result.replace(/\n/g, '');
          this.shopService.uploadImage(this.shop).subscribe(data => {
            this.shop.coverimage = data.imageURL;
            this.shopService.edit(this.shop).subscribe(shopRes => {
            }, err => {
              console.log(err);
            });
          }, err => {
            console.log(err);
          });
        };
      }
    } else {
      reader.onload = () => {
        this.shop.coverimage = reader.result.replace(/\n/g, '');
        this.shopService.uploadImage(this.shop).subscribe(data => {
          this.shop.coverimage = data.imageURL;
        }, err => {
          console.log(err);
        });
      };
    }

  }

  deletePromoteImage(image) {
    var isDuplicate = false;
    for (var i = 0; i < this.shop.promoteimage.length; i++) {
      if (image == this.shop.promoteimage[i]) {
        this.shop.promoteimage.splice(i, 1);
        this.shopService.edit(this.shop).subscribe(shopRes => {

        })
        break;
      }
    }
  }
  prmEdit() {
    if (this.promoteIsEdit == false) {
      this.promoteIsEdit = true;
    } else { this.promoteIsEdit = false; }
  }

  filterByCate(cateID, cateIndex) {
    this.selectedCate = cateIndex;
    this.oldsProducts = this.oldsProducts.length == 0 ? this.products : this.oldsProducts;
    console.log("CATE : " + cateID);
    console.log("1 Product : " + this.products);
    console.log("Old Product : " + this.oldsProducts);
    let dataFilter: Array<any> = [];
    this.oldsProducts.forEach((el, i) => {
      if (el.categories._id == cateID) {
        dataFilter.push(el);
      }
    });
    this.products = dataFilter;
    console.log("Pro : " + this.products);
  }

  createProduct(index, CateIndex) {
    this.CE_action_product = 'เพิ่ม';
    // $(this.modal.nativeElement).modalproduct('show');
    this.modalproduct.nativeElement.click();
    alert("Select prd index : " + index + "\nSelect Cate : " + CateIndex);

    // let createPRD = {
    //   name: ,
    //   images,
    //   price: ,
    //   categories: ,
    //   index: ,
    //   cateindex:
    // }
    // this.shopService.createProduct()

  }

  canselSaveProduct() {
    this.showeMainShop = true;
    this.showAddProduct = false;
  }

  editProduct(product) {
    this.showeMainShop = false;
    this.showAddProduct = true;
    this.product.name = product.name;
    this.product.price = product.price;
    this.product.categories = product.categories ? product.categories._id : '';
    this.CE_action_product = 'แก้ไข';
    this.CE_id_product = product._id;
  }

  deleteProduct(id) {
    this.shopService.deleteProduct(id).subscribe(data => {
      location.reload();
    }, err => {
      console.log(err);
    });
  }

  createEditCategory(ref, templete, category) {
    if (ref == "create") {
      this.category = {};
      this.showeMainShop = false;
      this.showAddCategory = true;
      this.CE_action_category = 'เพิ่ม';
    }
  }
  editCategory(edit, modal, category) {
    this.showeMainShop = false;
    this.showAddCategory = true;
    this.updateOrEditCateImg = category.image;
    this.category.name = category.name;
    this.CE_action_category = 'แก้ไข';
    this.CE_id_category = category._id;

  }


  cancelCategory(modal) {
    this.showeMainShop = true;
    this.showAddCategory = false;
    this.updateOrEditCateImg = null;

  }

  saveCategory() {
    if (this.CE_action_category == 'เพิ่ม') {
      this.category.shop = this.shopID;
      let sendCate = {
        name: this.category.name,
        image: this.updateOrEditCateImg
      }
      this.shopService.saveCategory(sendCate, this.shopID).subscribe(data => {
        console.log(data);
        alert("ระบบได้ทำการเพิ่มหมวดหมู่สินค้าเรียบร้อยแล้ว");
        this.categoryList[this.categoryList.length] = data;
        this.showeMainShop = true;
        this.showAddCategory = false;

        // this.InitialData();

      }, err => {
        alert("ระบบไม่สามารถเพิ่มหมวดหมู่ร้านค้าได้ กรุณาลองใหม่อีกครั้ง");
        console.log(err);
      });
    } else {
      this.category._id = this.CE_id_category;
      this.category.shop = this.shopID;
      this.shopService.editCategory(this.category).subscribe(data => {
        console.log(data);
        this.showeMainShop = true;
        this.showAddCategory = false;
        // this.InitialData();
      }, err => {
        console.log(err);
      });
    }
  }

  deleteCategory(id) {
    this.shopService.deleteCategory(id).subscribe(data => {
      location.reload();
    }, err => {
      console.log(err);
    });
  }
  deletePrdImg(i) {

  }

  uploadPrdImage() {
    this.prdimgInput.nativeElement.click();
  }
  onPrdImgChange(e) {
    const fileBrowser = this.prdimgInput.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (this.shopID) {
      if (fileBrowser.files.length > 0) {
        reader.onload = () => {
          let prdImgStr = reader.result.replace(/\n/g, '');
          this.product.images = prdImgStr;
          this.shopService.uploadPromoteImage(this.shop).subscribe(data => {
            // this.shop.promoteimage.push(data.imageURL);
            this.shopService.edit(this.shop).subscribe(shopRes => {
              alert("เพิ่มรูปภาพโปรโมทร้านเรียบร้อยแล้วค่ะ");
              this.shop.promoteimage[this.shop.promoteimage.length] = shopRes.imageURL;
              // this.shop.promoteimage.push(shopRes.imageURL);
            }, err => {
              alert("เกิดข้อผิดพลาดในการเพิ่มรูปภาพโปรโมทร้าน กรุณาลองใหม่อีกครั้งค่ะ");
              console.log(err);
            });
          }, err => {
            console.log(err);
          });
        };
      }
    } else {
      reader.onload = () => {
        let promteImgStr = reader.result.replace(/\n/g, '');
        this.shop.newpromoteimage = promteImgStr;
        this.shopService.uploadPromoteImage(this.shop).subscribe(data => {
          this.shop.promoteimage.push(data.imageURL);
        }, err => {
          console.log(err);
        });
      };
    }
  }

  saveProduct() {
    if (this.CE_action_product == 'เพิ่ม') {
      this.product.shop = this.shopID;
      // this.product.images = ['http://www.terminal21.co.th/asok/uploaded/content/FujiLogo.jpg'];
      this.shopService.saveProduct(this.product).subscribe(data => {
        console.log(data);
        this.showeMainShop = true;
        this.showAddProduct = false;
        location.reload();
      }, err => {
        console.log(err);
      });
    } else {
      this.product._id = this.CE_id_product;
      this.product.shop = this.shopID;
      // this.product.images = ['http://www.terminal21.co.th/asok/uploaded/content/FujiLogo.jpg'];
      this.shopService.editProduct(this.product).subscribe(data => {
        console.log(data);
        this.showeMainShop = true;
        this.showAddProduct = false;
        location.reload();
      }, err => {
        console.log(err);
      });
    }
  }
  getCurrentGeolocation(): Promise<any> {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(function (position) {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        reject("GEO Error");

      })

    })
  }
  openSelectMap() {
    this.showeditdiv = false;
    this.showeMap = true;



    setTimeout(() => {
      let latLng = { lat: this.currentGEO.lat, lng: this.currentGEO.lng };
      let map = new google.maps.Map(this.mapElement.nativeElement, {
        center: latLng,
        zoom: 18,
        mapTypeId: 'roadmap'
      });

      let input = this.pacinput.nativeElement;
      let searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);



      let marker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

      this.addMarker(map, latLng, marker);

      map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener('places_changed', function () {
        let places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }
        marker = new google.maps.Marker({
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: places[0].geometry.location
        });

        console.log(marker);
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

        let bounds = new google.maps.LatLngBounds();
        bounds.union(places[0].geometry.viewport);
        map.fitBounds(bounds);
      });

    }, 300);
  }

  addMarker(map, position, marker) {

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
  }

  changeEditShopMode() {
    if (this.isEditshopMode == false) {
      this.isEditshopMode = true;
      this.blockInput = false;
    } else {
      this.isEditshopMode = false;
      this.blockInput = true;
    }

  }

  cancelMap() {
    this.showeditdiv = true;
    this.showeMap = false;
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

  cancelEditShop() {
    if (this.shopID) {
      this.showeMainShop = true;
      this.showeditdiv = false;
      this.router.navigate(['/manage-shop']);
    } else {
      this.router.navigate(['/manage-shop']);
    }

  }

  selectCate(cate_id) {

    const inArr = this.selectList.indexOf(cate_id);

    if (this.selectList.length < 3) {
      if (inArr === -1) {
        this.selectList.push(cate_id);
        this.checkeds[cate_id] = true;
        if (this.shop.categories) {
          this.shop.categories.push({ _id: cate_id });
          for (let i = 0; i < this.shop.categories.length; i++) {
            for (let j = 0; j < this.categoryShopList.length; j++) {
              if (this.categoryShopList[j]._id === this.shop.categories[i]._id) {
                this.shop.categories[i] = {
                  _id: this.categoryShopList[j]._id,
                  name: this.categoryShopList[j].name
                };
                break;
              }
            }
          }
        }

      } else {
        this.selectList.splice(inArr, 1);
        if (this.shop.categories) {
          this.shop.categories.splice(inArr, 1);
        }
        this.checkeds[cate_id] = false;
      }
    } else {
      if (inArr !== -1) {
        this.selectList.splice(inArr, 1);
        if (this.shop.categories) {
          this.shop.categories.splice(inArr, 1);
        }
        this.checkeds[cate_id] = false;
      }
    }
  }

  save() {
    if (this.shopID) {
      this.shop.address = {
        address: this.address,
        lat: this.latLng.lat,
        lng: this.latLng.lng
      };
      this.shop.times = this.timeList;
      this.shop.coverimage = this.shop.coverimage ? this.shop.coverimage : 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=889&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D';
      this.shopService.edit(this.shop).subscribe(data => {
        this.isEditshopMode == false;
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
      this.shop.coverimage = this.shop.coverimage ? this.shop.coverimage : 'https://images.unsplash.com/photo-1470219556762-1771e7f9427d?auto=format&fit=crop&w=889&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D';

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

  cancelTime() {
    this.showeMainShop = false;
    this.showeditdiv = true;
    this.showeditTime = false;
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
  selectTab(tab) {

    switch (tab) {
      case 0: {
        this.selectTabs = 0;
        this.showeMap = false;

        break;
      }
      case 1: {
        this.selectTabs = 1;
        this.showeMap = false;

        break;
      }
      case 2: {
        this.selectTabs = 2;
        this.showeMap = false;
        break;
      }
      case 3: {
        this.selectTabs = 3;

        break;
      }
      default: {
        this.selectTabs = 0;
        break;
      }
    }
  }
}
