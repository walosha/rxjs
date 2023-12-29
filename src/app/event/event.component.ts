import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'angular-bootstrap-md';

import { AppService } from '../services/app.service';


import { } from 'googlemaps';
@Component({
    selector: 'app-event',
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.css']
})

export class EventComponent implements OnInit {    
    sliderImages: Array<string> = [];
    slideConfig: {};
    eventDetails: any;
    dateRange: "";
    highlightHotel = true;
    showAmount = false;
    showAttendeePopup = false;    
    hotel: any;
    venue: any;
    StartBuilding: any;
    UserName: any;
    DueDate: any;
    eventStatus: string;
    gaugeType = "full";
    gaugeValue = 0;
    gaugeLabel = "100";
    submitted: boolean = false; 
    DepositeDueDate: any;
    InviteDueDate: any;
    thresholdConfig = {
        '10': { color: 'red' },
        '40': { color: 'green' }
    };
    
    map: google.maps.Map;
    constructor(private httpClient: HttpClient, private route: ActivatedRoute, private appService: AppService, private router: Router) {        
        var status = this.route.snapshot.queryParams["status"];
        localStorage.setItem("EventStatus", status);
        setTimeout(() => {
            this.router.navigate(['/events']);
        }, 1000);
    }

    ngOnInit() {
        
    }    
}