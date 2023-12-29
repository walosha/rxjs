import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';


@Component({
    selector: 'app-validate-deal',
    templateUrl: './validate-deal.component.html',
    styleUrls: ['./validate-deal.component.css'],
})
export class ValidateDealComponent implements OnInit {
    
    loading: boolean = false;

    constructor(protected router: Router, public route: ActivatedRoute, private appService: AppService, private globalService: GlobalService) {
        
    }

    ngOnInit() {
        this.route.params.subscribe(res => {
            if(res){
                if (res['DealID']) {
                    if (this.globalService.UserID != '' && this.globalService.UserID != undefined) {
                        this.ValidateDeal(res['DealID'], this.globalService.UserID);
                    }
                    else {
                        localStorage.setItem("InvitedDealId", res['DealID']);
                        this.router.navigate(['/login']);
                    }
                }
                else {
                    this.router.navigate(['/home']);
                }
            }else{
                this.router.navigate(['/home']);
            }
        
        });
    }

    ValidateDeal(DealID: any, UserID: any){
        this.loading = true;
        var post = {
            "DealID": DealID,
            "ContactID": UserID,
            "Status": "Invited"
        }
        this.appService.Post("/api/Zoho/DealInviteByID", post)
            .subscribe((data: any) => {
                localStorage.removeItem("InvitedDealId");
                this.loading = true;
                this.router.navigate(['/myevent']);
            },
            (err: HttpErrorResponse) => {
                this.loading = true;
            }
        );        
    }
}
