import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ServerConfig } from 'app/provider/server.config';

@Injectable()
export class ManageUserService {

    constructor(private http: Http, public server: ServerConfig) { }

    getUser(): Observable<any> {
        return this.http.get(this.server.url + 'api/management/users', this.server.AuthHeaders())
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }
}