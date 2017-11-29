import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { of } from 'rxjs/observable/of';
import { ServerConfig } from 'app/provider/server.config';

@Injectable()
export class ShopService {

    constructor(private http: Http, public server: ServerConfig) { }

    save(shop): Observable<any> {
        return this.http.post(this.server.url + 'api/shops', shop, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    edit(shop): Observable<any> {
        return this.http.put(this.server.url + 'api/shops/' + shop._id, shop, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    delete(id): Observable<any> {
        return this.http.delete(this.server.url + 'api/shops/' + id, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    getShopByID(id): Observable<any> {
        return this.http.get(this.server.url + 'api/shops/' + id, this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
}
