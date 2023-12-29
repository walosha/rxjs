import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { AuthenticationService } from '../services/authentication.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

@Component({
    selector: 'app-myevent',
    templateUrl: './myevent.component.html',
    styleUrls: ['./myevent.component.css']
})

export class MyEventComponent implements OnInit {       
    UserName: string;
    minStartDate = new Date();
    maxStartDate = new Date();
    minEndDate = new Date();
    maxEndDate = new Date(); 
    dueDate = new Date();
    startDate = new Date(); 
    endDate = new Date();
    eventDate = new Date();
    eventData: any[];
    loading: boolean = false;

    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private globalService: GlobalService, private authenticationService: AuthenticationService) { }
    ngOnInit() {
        this.eventData = [];
        this.dueDate = new Date(this.dueDate.setMonth(this.dueDate.getMonth() + 1));
        if (this.globalService.UserID == '' && this.globalService.UserID == undefined) {
            this.router.navigate(['/login']);
        }
        this.UserName = this.globalService.UserName;
        this.GetMyEvent(this.globalService.UserID);
    }

    GoToNotifactions(proposal: object) {
        localStorage.setItem("AdminEventData", JSON.stringify(proposal))
        this.router.navigate(['/notifications']);
    }

    GetMyEvent(id) {
        this.loading = true;
        this.appService.Post("API/Zoho/GetMyEvent", { Id: id })
            .subscribe(data => {
                var response = data as any[];
                this.eventData = response;
                this.loading = false;
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
    }

    GoToEvent(event: any) {
        localStorage.setItem("ProposalID", event.ProposalID);
        this.router.navigate(['/events']);
    }
}
