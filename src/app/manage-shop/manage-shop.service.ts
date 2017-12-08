import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ServerConfig } from 'app/provider/server.config';

@Injectable()
export class ManageShopService {

    constructor(private http: Http, public server: ServerConfig) { }

    save(data): Observable<any> {
        return this.http.post(this.server.url + 'api/shops', data, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    getList(): Observable<any> {
        return this.http.get(this.server.url + 'api/shops', {})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
    getListShop(): Observable<any> {
        return this.http.get(this.server.url + 'api/shops/categorie', {})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    getLocalJSONshoplist(): Observable<any> {
        return this.http.get('./assets/data/manage-shop.json', {})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

}