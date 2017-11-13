import { Component, OnInit } from '@angular/core';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

@Component({
  selector: 'app-manage-shop',
  templateUrl: './manage-shop.component.html',
  styleUrls: ['./manage-shop.component.css']
})
export class ManageShopComponent implements OnInit {

  constructor(public modal: Modal) { }

  ngOnInit() {
  }

  onClick() {
    const dialogRef = this.modal.alert()
      .size('lg')
      .showClose(true)
      .title('เพิ่มข้อมูลร้านค้า')
      .body(``)
      .open();

    dialogRef
      .then(dialogRef => {
        dialogRef.result.then(result => {
          alert(result);
        });
      });
  }

  apple(dook) {
    console.log(dook);
  }

}
