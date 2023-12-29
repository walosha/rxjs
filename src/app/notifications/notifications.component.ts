import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit {
    EventName: string;
    minStartDate = new Date();
    maxStartDate = new Date();
    minEndDate = new Date();
    maxEndDate = new Date();
    dueDate = new Date();
    startDate: any;
    endDate: any;
    eventDate = new Date();
    notificationData: any[];
    notificationDataBackup: any[];
    documents: any[];
    loading: boolean = false;

    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private globalService: GlobalService) { }
    ngOnInit() {
        this.notificationData = [];
        this.documents = [];
        this.EventName = '';
        this.dueDate = new Date(this.dueDate.setMonth(this.dueDate.getMonth() + 1));
        if (this.globalService.UserID == '' && this.globalService.UserID == undefined) {
            this.router.navigate(['/login']);
        }
        if (localStorage.getItem("DealID") != undefined) {
            this.GetNotifications(localStorage.getItem('DealID'));
        }
        else {
            this.router.navigate(['/myevent']);
        }
    }

    GetNotifications(id) {
        this.loading = true;
        this.appService.Get("API/Zoho/GetDealNotifications/" + id)
            .subscribe(data => {
                var response = data as any[];
                this.notificationData = response;
                this.notificationDataBackup = response;
                this.loading = false;
                console.log(data);
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }
    
}
