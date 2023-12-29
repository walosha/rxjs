import { Injectable, EventEmitter, Output } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AuthenticationService implements CanActivate {
    constructor(protected router: Router, protected _appService: AppService, protected _globalService: GlobalService) { }
    @Output() getLoggedInName: EventEmitter<any> = new EventEmitter();

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        debugger;
        var currentRoute = window.location.pathname.toLowerCase();
        let userId = this.getCookie("UserID") as any;
        let date = new Date();
        if (userId > 0) {
            this._appService.Get("api/Zoho/GetUser/" + userId)
                .subscribe(data => {
                    var response = data as any;
                    return Observable.create(true);
                },
                (err: HttpErrorResponse) => {                        
                    console.log(err.message);
                    return Observable.create(false);
                }
            );
            this.router.navigateByUrl('/login');
            return Observable.create(true);
        }
        else {
            this.router.navigateByUrl('/login');
        }
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }
    
    login(email: string, password: string): Observable<boolean> {        
        if (localStorage.getItem("User") != undefined) {
            var User = JSON.parse(localStorage.getItem("User"));
            var UserName = User.Full_Name;
            this.getLoggedInName.emit(UserName);
            return Observable.create(true);
        }
        else {
            this.getLoggedInName.emit("Login");
            return Observable.create(false);
        }
    }

    logout(): void {
        this.getLoggedInName.emit("Login");
    }
    
}