import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TableListComponent } from './table-list/table-list.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { SalesComponent } from './sales/sales.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { ProductComponent } from './product/product.component';
import { CustomerComponent } from './customer/customer.component';
import { ManageFileComponent } from './manage-file/manage-file.component';
import { ManageDocumentComponent } from './manage-document/manage-document.component';
import { CreateSellComponent } from './create-sell/create-sell.component';
import { DashboardService } from 'app/dashboard/dashboard.service';
import { ManageShopComponent } from './manage-shop/manage-shop.component';

import { FacebookModule } from 'ngx-facebook';
import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    SalesComponent,
    PurchaseOrderComponent,
    ProductComponent,
    CustomerComponent,
    ManageFileComponent,
    ManageDocumentComponent,
    CreateSellComponent,
    ManageShopComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ComponentsModule,
    RouterModule,
    ModalModule.forRoot(),
    FacebookModule.forRoot(),
    BootstrapModalModule,
    AppRoutingModule
  ],
  providers: [
    DashboardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
