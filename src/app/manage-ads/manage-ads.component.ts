import { Component, OnInit, ElementRef, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { ADSService } from 'app/manage-ads/manage-ads.service';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { PubSubService } from 'angular2-pubsub';
declare let $: any;

@Component({
  selector: 'app-manage-ads',
  templateUrl: './manage-ads.component.html',
  styleUrls: ['./manage-ads.component.scss']
})

export class ManageAdsComponent implements OnInit {
  @ViewChild('modalads') modalads: ElementRef;
  @ViewChild('uploadADS') uploadADS;

  private listAdsActive: Array<any> = [];
  private listAdsInActive: Array<any> = [];
  private listAdsExpired: Array<any> = [];
  private CE_action_ads: string;
  private adsimgAdding: any = null;
  private type;
  private adsvdoAdding: any = null;
  private vdolink: string;
  private yt = 'https://www.youtube.com/embed/';
  private adsDATA: any = {};
  private ckLinkNull: boolean = true;
  private adsStatus: boolean = false;
  private vdolinkinput: string;
  private today = new Date();
  private isEditImage: boolean = false;

  constructor(private ADSservice: ADSService, private server: ServerConfig, private router: Router, public sanitizer: DomSanitizer, private pubsub: PubSubService) {

  }


  ngOnInit() {
    console.log('object');
    this.pubsub.$pub('loading', true);
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.pubsub.$pub('loading', false);
        this.router.navigate(['/login']);
      }
      this.LoadInitial();
    });

  }

  LoadInitial() {
    this.listAdsActive = [];
    this.listAdsInActive = [];
    this.listAdsExpired = [];
    this.ADSservice.getAdsList().subscribe((data) => {
      this.pubsub.$pub('loading', false);
      data.forEach((element) => {
        if (element.status == true && element.effectivedateend >= this.today.toISOString()) {
          this.listAdsActive.push(element);
        } else if (element.status == false && element.effectivedateend >= this.today.toISOString()) {
          this.listAdsInActive.push(element);
        } else if (element.effectivedateend < this.today.toISOString()) {
          this.listAdsExpired.push(element);
        }
      });

      console.log(data);
      console.log(this.listAdsActive);
      console.log(this.listAdsInActive);
      console.log(this.listAdsExpired);
      // DEFAULT INIT DATA
      this.adsDATA.status = false;
      // DEFAULT INIT DATA
    }, (err) => {
      console.log(err);

    });
  }

  addADS() {
    this.vdolinkinput = '';
    this.vdolink = '';
    this.CE_action_ads = "เพิ่ม";
    this.type = 'image';
    this.cancelSave();
    $(this.modalads.nativeElement).modal('show');
  }
  editADS(item) {
    this.CE_action_ads = "แก้ไข";
    let itemdata = JSON.parse(JSON.stringify(item));
    this.adsDATA = itemdata;
    console.log(this.adsDATA);
    if (item.isvideo == false) {
      this.type = 'image';
    } else if (item.isvideo == true) {
      this.type = 'vdo';
      this.vdolink = this.yt + item.videoid;
    }
    this.adsDATA.effectivedatestart = this.adsDATA.effectivedatestart.toString().substring(0, 10);
    this.adsDATA.effectivedateend = this.adsDATA.effectivedateend.toString().substring(0, 10);
    this.adsStatus = item.status;
    this.adsimgAdding = item.image;
    $(this.modalads.nativeElement).modal('show');
  }


  changeType() {
    if (this.type == 'vdo') {
      this.vdolink = this.yt + this.adsDATA.videoid;
    }
  }

  activeChange($event) {
    if ($event === true) {
      this.adsDATA.status = true;
    } else if ($event === false) {
      this.adsDATA.status = false;
    }
  }

  upLink(link) {
    this.ckLinkNull = false;
    this.vdolink = this.yt + link;
    this.adsDATA.videoid = link;
  }

  selectADSimg() {
    this.uploadADS.nativeElement.click();
  }
  onADSImgChange($event) {
    console.log("PASS");
    const fileBrowser = this.uploadADS.nativeElement;
    const reader = new FileReader();
    reader.readAsDataURL(fileBrowser.files[0]);
    if (fileBrowser.files.length > 0) {
      reader.onload = () => {
        this.isEditImage = true;
        this.adsimgAdding = reader.result.replace(/\n/g, '');
      };
    }
  }

  saveADS() {
    this.pubsub.$pub('loading', true);
    if (this.CE_action_ads == "เพิ่ม") {
      if (this.type == 'image') {
        if (this.adsimgAdding) {
          let sendADS;
          this.ADSservice.uploadImage(this.adsimgAdding).subscribe((upImg) => {
            sendADS = {
              name: this.adsDATA.name,
              description: this.adsDATA.description,
              image: upImg.imageURL,
              isvideo: false,
              website: this.adsDATA.website,
              effectivedatestart: this.adsDATA.effectivedatestart,
              effectivedateend: this.adsDATA.effectivedateend,
              status: this.adsStatus
            }
            this.ADSservice.postAds(sendADS).subscribe((data) => {
              console.log(data);
              this.pubsub.$pub('loading', false);
              $(this.modalads.nativeElement).modal('hide');
              alert("ระบบได้ทำการเพิ่มรูปภาพโฆษณาเรียบร้อยแล้วค่ะ");
              this.LoadInitial();
            }, (errSave) => {
              console.log(errSave);
              this.pubsub.$pub('loading', false);
              alert("ระบบไม่สามารถทำการเพิ่มรูปภาพโฆษณาได้ค่ะ");
            });
          }, (err) => {
            console.log(err);
            this.pubsub.$pub('loading', false);
            alert("ระบบไม่สามารถอัพโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้งค่ะ");
          })
        } else {
          this.pubsub.$pub('loading', false);
          alert("กรุณาเพิ่มรูปภาพโฆษณาก่อนทำการบันทึกค่ะ");
        }
      } else if (this.type == 'vdo') {
        this.pubsub.$pub('loading', true);
        if (!this.adsDATA || this.adsDATA.videoid === '') {
          this.pubsub.$pub('loading', false);
          alert("กรุณาใส่ ID ของ Video YOUTUBE ด้วยค่ะ");
        } else if (!this.adsimgAdding) {
          this.pubsub.$pub('loading', false);
          alert("กรุณาเพิ่มรูปภาพโฆษณาด้วยค่ะ");
        } else if (!this.adsimgAdding && this.ckLinkNull) {
          this.pubsub.$pub('loading', false);
          alert("กรุณาเพิ่มรูปภาพโฆษณาและวีดีโอโฆษณาด้วยค่ะ");
        } else if (this.adsimgAdding) {
          this.ADSservice.uploadImage(this.adsimgAdding).subscribe((upImg) => {
            let sendADS = {
              name: this.adsDATA.name,
              image: upImg.imageURL,
              description: this.adsDATA.description,
              videoid: this.adsDATA.videoid,
              isvideo: true,
              website: this.adsDATA.website,
              effectivedatestart: this.adsDATA.effectivedatestart,
              effectivedateend: this.adsDATA.effectivedateend,
              status: this.adsStatus
            }
            this.ADSservice.postAds(sendADS).subscribe((data) => {
              console.log(data);
              this.pubsub.$pub('loading', false);
              $(this.modalads.nativeElement).modal('hide');
              alert("ระบบได้ทำการเพิ่มวีดีโอโฆษณาเรียบร้อยแล้วค่ะ");
              this.LoadInitial();
            }, (err) => {
              console.log(err);
              this.pubsub.$pub('loading', false);
              alert("ระบบไม่สามารถเพิ่มวีดีโอโฆษณาได้ กรุณาลองใหม่อีกครั้งค่ะ");
            });
          }, (errUpimage) => {
            this.pubsub.$pub('loading', false);
            alert("ระบบไม่สามารถทำการเพิ่มรูปภาพโฆษณาได้ค่ะ");
          });
        }
      }
    } else if (this.CE_action_ads == "แก้ไข") {
      if (this.type == 'image') {
        if (this.adsimgAdding) {
          let sendADS;
          if (this.isEditImage == true) {
            this.ADSservice.uploadImage(this.adsimgAdding).subscribe((upImg) => {
              sendADS = {
                _id: this.adsDATA._id,
                name: this.adsDATA.name,
                description: this.adsDATA.description,
                image: upImg.imageURL,
                isvideo: false,
                website: this.adsDATA.website,
                effectivedatestart: this.adsDATA.effectivedatestart,
                effectivedateend: this.adsDATA.effectivedateend,
                status: this.adsStatus
              }
              this.ADSservice.editAds(sendADS).subscribe((data) => {
                console.log(data);
                this.pubsub.$pub('loading', false);
                $(this.modalads.nativeElement).modal('hide');
                alert("ระบบได้ทำการแก้ไขโฆษณาเรียบร้อยแล้วค่ะ");
                this.LoadInitial();
              }, (errSave) => {
                console.log(errSave);
                this.pubsub.$pub('loading', false);
                alert("ระบบไม่สามารถทำการแก้ไขโฆษณาได้ค่ะ");
              });
            }, (err) => {
              console.log(err);
              this.pubsub.$pub('loading', false);
              alert("ระบบไม่สามารถอัพโหลดรูปภาพแก้ไขได้ กรุณาลองใหม่อีกครั้งค่ะ");
            })
          } else if (this.isEditImage == false) {
            sendADS = {
              _id: this.adsDATA._id,
              name: this.adsDATA.name,
              description: this.adsDATA.description,
              image: this.adsimgAdding,
              isvideo: false,
              website: this.adsDATA.website,
              effectivedatestart: this.adsDATA.effectivedatestart,
              effectivedateend: this.adsDATA.effectivedateend,
              status: this.adsStatus
            }
            this.ADSservice.editAds(sendADS).subscribe((data) => {
              console.log(data);
              this.pubsub.$pub('loading', false);
              $(this.modalads.nativeElement).modal('hide');
              alert("ระบบได้ทำการแก้ไขโฆษณาเรียบร้อยแล้วค่ะ");
              this.LoadInitial();
            }, (errSave) => {
              console.log(errSave);
              this.pubsub.$pub('loading', false);
              alert("ระบบไม่สามารถทำการแก้ไขโฆษณาได้ค่ะ");
            });
          }
        } else {
          this.pubsub.$pub('loading', false);
          alert("กรุณาเพิ่มรูปภาพโฆษณาก่อนทำการบันทึกค่ะ");
        }
      } else if (this.type == 'vdo') {
        this.pubsub.$pub('loading', true);
        if (!this.adsDATA || this.adsDATA.videoid === '') {
          this.pubsub.$pub('loading', false);
          alert("กรุณาใส่ ID ของ Video YOUTUBE ด้วยค่ะ");
        } else if (!this.adsimgAdding) {
          this.pubsub.$pub('loading', false);
          alert("กรุณาเพิ่มรูปภาพโฆษณาด้วยค่ะ");
        } else if (!this.adsimgAdding && this.ckLinkNull) {
          this.pubsub.$pub('loading', false);
          alert("กรุณาเพิ่มรูปภาพโฆษณาและวีดีโอโฆษณาด้วยค่ะ");
        } else if (this.adsimgAdding) {
          if (this.isEditImage == true) {
            this.ADSservice.uploadImage(this.adsimgAdding).subscribe((upImg) => {
              let sendADS = {
                _id: this.adsDATA._id,
                name: this.adsDATA.name,
                image: upImg.imageURL,
                description: this.adsDATA.description,
                videoid: this.adsDATA.videoid,
                isvideo: true,
                website: this.adsDATA.website,
                effectivedatestart: this.adsDATA.effectivedatestart,
                effectivedateend: this.adsDATA.effectivedateend,
                status: this.adsStatus
              }
              this.ADSservice.editAds(sendADS).subscribe((data) => {
                console.log(data);
                this.pubsub.$pub('loading', false);
                $(this.modalads.nativeElement).modal('hide');
                alert("ระบบได้ทำการแก้ไขโฆษณาเรียบร้อยแล้วค่ะ");
                this.LoadInitial();
              }, (err) => {
                console.log(err);
                this.pubsub.$pub('loading', false);
                alert("ระบบไม่สามารถทำการแก้ไขโฆษณาได้ กรุณาลองใหม่อีกครั้งค่ะ");
              });
            }, (errUpimage) => {
              this.pubsub.$pub('loading', false);
              alert("ระบบไม่สามารถทำการแก้ไขโฆษณาได้ค่ะ");
            });
          } else if (this.isEditImage == false) {
            let sendADS = {
              _id: this.adsDATA._id,
              name: this.adsDATA.name,
              image: this.adsimgAdding,
              description: this.adsDATA.description,
              videoid: this.adsDATA.videoid,
              isvideo: true,
              website: this.adsDATA.website,
              effectivedatestart: this.adsDATA.effectivedatestart,
              effectivedateend: this.adsDATA.effectivedateend,
              status: this.adsStatus
            }
            this.ADSservice.editAds(sendADS).subscribe((data) => {
              console.log(data);
              this.pubsub.$pub('loading', false);
              $(this.modalads.nativeElement).modal('hide');
              alert("ระบบได้ทำการแก้ไขโฆษณาเรียบร้อยแล้วค่ะ");
              this.LoadInitial();
            }, (err) => {
              console.log(err);
              this.pubsub.$pub('loading', false);
              alert("ระบบไม่สามารถทำการแก้ไขโฆษณาได้ กรุณาลองใหม่อีกครั้งค่ะ");
            });
          }

        }
      }
    }
  }
  removeAds(item) {
    const cfDelete = confirm('คุณต้องการลบโฆษณานี้ใช่หรือไม่');
    if (cfDelete) {
      this.pubsub.$pub('loading', true);
      this.ADSservice.delteAds(item).subscribe((success) => {
        alert("ระบบได้ทำการลบโฆษณาเรียบร้อยแล้วค่ะ");
        $(this.modalads.nativeElement).modal('hide');
        this.cancelSave();
        this.LoadInitial();

      }, (err) => {
        alert("ระบบไม่สามารถทำการลบโฆษณาได้ค่ะ กรุณาลองใหม่อีกครั้ง");
        this.pubsub.$pub('loading', false);
      })
    }
  }

  cancelSave() {
    $(this.modalads.nativeElement).modal('hide');
    this.adsimgAdding = null;
    this.adsvdoAdding = null;
    this.ckLinkNull = null;
    this.adsDATA.name = '';
    this.adsDATA.description = '';
    this.adsDATA.videoid = '';
    this.adsDATA.effectivedatestart = '';
    this.adsDATA.effectivedateend = '';
    this.adsDATA.website = '';
    this.adsDATA.isvideo = false;
    this.adsStatus = false;
    this.vdolink = '';
  }
}
