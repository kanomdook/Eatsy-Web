import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

@Injectable()
export class ServerConfig {
    public url: string = 'https://eatsyd.herokuapp.com/';

    constructor() {

    }

    AuthHeaders() {
        let headers = new Headers();
        // headers.append('Authorization', 'Bearer ' + window.localStorage.getItem('token'));
        headers.append('Authorization', 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRvb2siLCJsb2dpbkV4cGlyZXMiOiIyMDE3LTEwLTMwVDA0OjQzOjE1LjcyOFoiLCJpYXQiOjE1MTA4OTQwMzB9.SrY14jllOm-MTGmUZ-iG9mTDLzpi88PPsh8JuW0Xku8');
        return { headers: headers };
    }
}
