import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-adminevent',
    templateUrl: './adminevent.component.html',
    styleUrls: ['./adminevent.component.css']
})

export class AdminEventComponent implements OnInit {
    EventName: string;
    minStartDate = new Date();
    maxStartDate = new Date();
    minEndDate = new Date();
    maxEndDate = new Date();
    dueDate = new Date();
    startDate: any;
    endDate: any;
    eventDate = new Date();
    eventData: any[];
    eventDataBackup: any[];
    documents: any[];
    loading: boolean = false;

    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private authenticationService: AuthenticationService, private globalService: GlobalService) { }
    ngOnInit() {
        this.eventData = [];
        this.documents = [];
        this.EventName = '';
        this.dueDate = new Date(this.dueDate.setMonth(this.dueDate.getMonth() + 1));
        if (this.globalService.UserID != '' && this.globalService.UserID != undefined) {
            this.GetAdminEvent(this.globalService.UserID);
        }
        else {
            this.router.navigate(['/login']);
        }
    }

    GetAdminEvent(id) {
        this.loading = true;
        this.appService.Post("API/Zoho/GetAdminEvent", { Id: id })
            .subscribe(data => {
                var response = data as any[];
                this.eventData = response;
                this.eventDataBackup = response;
                

                setTimeout(() => {
                    this.loading = false;
                }, 300);

            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
    }

    /// Set end date when start date change    
    startDateChange(date: any) {
        this.startDate = new Date(date.value);
        this.minEndDate = this.startDate;
        this.SearchData();
    }

    /// to date change function
    endDateChange(date: any) {
        this.endDate = new Date(date.value);
        this.maxStartDate = this.endDate;
        this.SearchData();
    }

    onSearch(eventName) {
        this.EventName = eventName.target.value.toLowerCase();
        this.SearchData();
    }

    SearchData() {
        this.eventData = this.eventDataBackup;
        this.eventData = this.eventData.filter(items => this.EventName == '' ? true : items.EventName.toLowerCase().includes(this.EventName));

        this.eventData = this.eventData.filter(items => this.startDate == undefined ? true : this.startDate <= new Date(items.BeginDate) || this.startDate <= new Date(items.EndDate));

        this.eventData = this.eventData.filter(items => this.endDate == undefined ? true : this.endDate >= new Date(items.BeginDate) || this.endDate >= new Date(items.EndDate));
    }

    GoToEvent(event: any) {
        localStorage.setItem("ProposalID", event.ProposalID);
        this.router.navigate(['/events']);
    }

    GoToProposalCart(proposal: any) {
        localStorage.setItem("DealID", proposal.DealID);
        this.router.navigate(['/proposal-cart']);
    }

    GoToNotifactions(proposal: any){
        localStorage.setItem("DealID", proposal.DealID);
        this.router.navigate(['/notifications']);
    }

}
