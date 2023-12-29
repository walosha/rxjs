import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { GlobalService } from '../services/global.service'

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    UserName: string;
    IsAdmin: boolean;
    constructor(protected router: Router, private authenticationService: AuthenticationService, protected globalService: GlobalService) {
        authenticationService.getLoggedInName.subscribe(name => this.changeName(name));
        router.events.forEach((event) => {
            if (event instanceof NavigationStart) {
                if (event['url'] == '/eventregister') {
                    localStorage.removeItem("User");
                    this.UserName = null;
                }
            }
        });
        this.IsAdmin = this.globalService.IsAdmin;
    }
    
    ngOnInit() {
        this.UserName = this.globalService.UserName;
    }

    Logout() {
        this.globalService.UserID = '';
        this.globalService.UserName = '';
        this.globalService.createCookie("UserID", "", 0);
        this.globalService.createCookie("UserName", "", 0);
        this.UserName = null;
        this.router.navigate(['/login']);
    }

    private changeName(name: string): void {
        this.UserName = name;
        this.IsAdmin = this.globalService.IsAdmin;
    }

    goToProposal(){
        // [routerLink]="['/proposal-cart']"
        localStorage.removeItem('proposalModel');
        this.router.navigate(['/proposal-cart']);
    }
}
