import { Component, OnInit } from '@angular/core';
import { Auth } from 'app/provider/auth';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ServerConfig } from 'app/provider/server.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private credentials: any = {};

  constructor(private server: ServerConfig, private auth: Auth, private router: Router) {

  }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (data) {
        this.router.navigate(['/manage-shop']);
      }
    });
  }

  login() {
    this.auth.sigin(this.credentials).subscribe(data => {
      window.localStorage.setItem('user', JSON.stringify(data));
      window.location.reload();
      this.router.navigate(['/manage-shop']);
    }, err => {
      console.log(err);
    });
  }

}
