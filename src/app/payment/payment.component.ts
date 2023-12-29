import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatePipe, PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'angular-bootstrap-md';
import { PlotBand } from '@progress/kendo-angular-charts';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import { AppService } from '../services/app.service';
import { HotelInterface } from '../hotels/hotel.class';
import { VenueInterface } from '../venues/venue.class';

import { GlobalService } from '../services/global.service';


@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css']
})

export class PaymentComponent implements OnInit {
    @ViewChild('paymentModal') paymentModal: ModalDirective;
    @ViewChild('paymentNowModal') paymentNowModal: ModalDirective;
    @ViewChild('inviteAttendee') inviteAttendee: ModalDirective;
    sliderImages: Array<string> = [];
    slideConfig: {};
    eventDetails: any;
    dateRange: "";
    highlightHotel = true;
    showAmount = false;
    showAttendeePopup = false;
    private gmapElement: ElementRef;
    hotel: any;
    venue: any;
    StartBuilding: any;
    UserName: any;
    DueDate: any;
    eventStatus: string;
    gaugeType = "full";
    gaugeValue = 0;
    gaugeLabel = "100";
    goalGaugeValue = 0;
    submitted: boolean = false;
    DepositeDueDate: any;
    InviteDueDate: any;
    PickupRoomType: number = 1;
    eventDetail: any;
    loading: boolean = false;
    thresholdConfig = {
        '10': { color: 'red' },
        '40': { color: 'green' }
    };

    public pointers: any[] = [{
        value: 0,
        color: '#ff891e'
    }];

        
    public humPlotBands: PlotBand[] = [{
        from: 0, to: 2500, color: '#ccc', opacity: 1
    }];

    public goalGauge = [[this.goalGaugeValue]];

    goalGaugeMax: number = 0;

    couples: number = 1;

    @ViewChild('gmap') set content(content: ElementRef) {
        this.gmapElement = content;
    }
    map: google.maps.Map;

    hotel_event_detail:any;

    attendees_list: Array<object> = [];

    visible = true;
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    fruitCtrl = new FormControl();
    filteredFruits: Observable<string[]>;
    fruits: string[] = [];
    allFruits: string[] = [];
    @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;
    
    hotelDetail: HotelInterface;
    hotelDetails: any;
    Arr = Array;
    venueDetail: VenueInterface;
    amount: number = 0;
    IsAdmin: boolean;

    constructor(private httpClient: HttpClient, private route: ActivatedRoute, private appService: AppService, private router: Router, public dialog: MatDialog, protected globalService: GlobalService) {
        this.eventStatus = "Saved";
        this.IsAdmin = this.globalService.GetIsAdminAccount() == "true";
        var status = this.route.snapshot.queryParams["status"];
        if (status) {
            localStorage.setItem("EventStatus", status);
        }
        status = localStorage.getItem("EventStatus");
        if (status != '' && status != undefined) {
            this.eventStatus = status;
        }
        var depositeDueDate = new Date();
        this.DepositeDueDate = new Date(depositeDueDate.setDate(depositeDueDate.getDate() + 10));
        this.InviteDueDate = new Date(depositeDueDate.setDate(depositeDueDate.getDate() + 20));

        if (this.eventStatus == "Payment Sprint 2" || this.eventStatus == "Payment") {
            this.gaugeValue = 30;
            this.goalGaugeValue = 4675;            
            this.goalGauge = [[this.goalGaugeValue]];
            this.pointers = [{
                value: 10,
                color: '#d9534f'
            }, {
                value: 40,
                color: '#449d44'
            }, {
                value: 30,
                color: '#ff891e'
            }];
        }
        else if (this.eventStatus == "Paid") {
            this.gaugeValue = 32;
            this.goalGaugeValue = 4921;            
            this.goalGauge = [[this.goalGaugeValue]];
            this.pointers = [{
                value: 10,
                color: '#d9534f'
            }, {
                value: 42,
                color: '#449d44'
            }, {
                value: 32,
                color: '#ff891e'
            }];
        }
        this.eventDetail = {};

        this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
            startWith(null),
            map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
    }

    ngOnInit() {
        if(!localStorage.getItem('hotel_event_detail')){
            this.router.navigate(['/adminevent']);
        }
        // 4821254000001760002
        this.getInvitees();
        this.hotel_event_detail = JSON.parse(localStorage.getItem('hotel_event_detail'));
        this.getHotelDetail()
        this.appService.getEvent()
            .subscribe((data: {}) => {
                this.sliderImages = data["sliderImages"];
                this.eventDetails = { ...data };
                this.getAttendeesCount();

                var sessionValue = localStorage.getItem("ConfirmDetail");
                if (sessionValue != '' && sessionValue != undefined) {
                    var sessionObject = JSON.parse(sessionValue);

                    this.eventDetails.eventName = sessionObject.eventName;
                    this.eventDetails.Organization = sessionObject.organization.name;
                    this.eventDetails.University = sessionObject.university.name;
                    this.eventDetails.CheckIn = new Date(sessionObject.CheckIn);
                    this.eventDetails.CheckOut = new Date(sessionObject.CheckOut);
                    this.eventDetails.EventDate = new Date(sessionObject.EventDate);
                    this.eventDetails.TotalAttendees = sessionObject.TotalAttendees;
                    this.eventDetails.Price = sessionObject.Price;
                    this.eventDetails.amount = sessionObject.amount;

                    this.goalGaugeMax = (this.eventDetails.TotalAttendees / 2) * this.eventDetails.Price;
                }
            });

        if (localStorage.getItem('ProposalID') != undefined) {
            this.GetEventDetail(localStorage.getItem('ProposalID'));
        }
        else {
            this.router.navigate(['/adminevent']);
        }

        var datePipe = new DatePipe("en-US");

        var sessionValue = localStorage.getItem("StartBuilding");
        if (sessionValue != '' && sessionValue != undefined) {
            var sessionObject = JSON.parse(sessionValue);
            this.StartBuilding = sessionObject;

            var startDate = new Date(sessionObject.startDate);
            this.DueDate = datePipe.transform(new Date(startDate.setDate(startDate.getDate() + 30)), 'MMMM dd, yyyy');
        }

        if (localStorage.getItem("User") != undefined) {
            var User: any = JSON.parse(localStorage.getItem("User"));
            this.UserName = User.Full_Name;
        }
    }

    getHotelDetail(){

        this.amount = this.couples * this.hotel_event_detail.PricePerCouple;
        this.appService.Get("/API/Zoho/GetHotelDetail?hotelId=" + this.hotel_event_detail.Hotel.ID)
        .subscribe(data => {
            this.hotelDetail = data as HotelInterface;
            this.loading = false;

            this.getVenueDetail(this.hotelDetail.PlaceID);
            
            setTimeout(() => {
                var mapProp = {
                    center: new google.maps.LatLng(this.hotelDetail.Latitude, this.hotelDetail.Longitude),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                };
        
                this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(this.hotelDetail.Latitude, this.hotelDetail.Longitude),
                    map: this.map,
                    title: this.hotelDetail.HotelName,
                    // router: this.router,
                    icon: ' ',
                    label: {
                        fontFamily: 'Fontawesome',
                        text: '\uf041',
                        fontSize: '32px',
                        color: '#FB6100'
                    }
                });
            }, 1000);
        },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }

    getVenueDetail(PlaceID: any){
        // "/API/Zoho/GetVenueDetail?venueId=" + this.venueDetail.ID + "&placeID=" + this.hotel.PlaceID
        this.appService.Get("/API/Zoho/GetVenueDetail?venueId=" + this.hotel_event_detail.Venue.ID + "&placeID=" + PlaceID)
        .subscribe(data => {
            this.venueDetail = data as VenueInterface;
            this.loading = false;
        },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }

    /// Get average of reviews
    reviewStar(reviews: any) {
        var reviewTotal = 0;
        if (reviews != null && reviews.length > 0) {
            for (var i = 0; i < reviews.length; i++) {
                var review = reviews[i];
                reviewTotal += review.ReviewStar;
            }
            return reviewTotal / reviews.length;
        }
        return 0;
    }

    getInvitees(){
        var AdminEventData: any = localStorage.getItem('AdminEventData');
        if(!AdminEventData){
            return;
        }
        
        AdminEventData = JSON.parse(AdminEventData);
        this.appService.Get("api/Zoho/GetInvitesByDealID?dealId="+AdminEventData.DealID)
        .subscribe(data => {
            if(data){
                var response = data as any[];
                this.attendees_list = response;
            }
            setTimeout(() => {
                this.loading = false;
            }, 500);
        },
            (err: HttpErrorResponse) => {
                setTimeout(() => {
                    this.loading = false;
                }, 500);
            }
        );

    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
    
        // Add our fruit
        if ((value || '').trim()) {
          this.fruits.push(value.trim());
        }
    
        // Reset the input value
        if (input) {
          input.value = '';
        }
    
        this.fruitCtrl.setValue(null);
      }
    
      remove(fruit: string): void {
        const index = this.fruits.indexOf(fruit);
    
        if (index >= 0) {
          this.fruits.splice(index, 1);
        }
      }
    
      selected(event: MatAutocompleteSelectedEvent): void {
        this.fruits.push(event.option.viewValue);
        this.fruitInput.nativeElement.value = '';
        this.fruitCtrl.setValue(null);
      }
    
      private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
    
        return this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
      }

    GetEventDetail(id) {
        this.loading = true;
        this.appService.Post("API/Zoho/GetEventDetail", { Id: id })
            .subscribe(data => {
                console.log(data);
                this.loading = false;
                var response = data as any;
                this.eventDetail = response;
                return;
                var mapProp = {
                    center: new google.maps.LatLng(this.eventDetail.Hotel.Latitude, this.eventDetail.Hotel.Longitude),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                };
                this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

                var hotelMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(this.eventDetail.Hotel.Latitude, this.eventDetail.Hotel.Longitude),
                    map: this.map,
                    title: this.eventDetail.Hotel.HotelName,
                    icon: ' ',
                    label: {
                        fontFamily: 'Fontawesome',
                        text: '\uf041',
                        fontSize: '32px',
                        color: '#FB6100'
                    }
                });

                var venueMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(this.eventDetail.Venue.Latitude, this.eventDetail.Venue.Longitude),
                    map: this.map,
                    icon: ' ',
                    title: this.eventDetail.Venue.VenueName,
                    label: {
                        fontFamily: 'Fontawesome',
                        text: '\uf041',
                        fontSize: '32px',
                        color: '#f725de'
                    }
                });
                this.loading = false;
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }

    PaymentSubmit() {
        this.submitted = true;
        setTimeout(() => {
            this.paymentModal.hide();
            this.submitted = false;
            this.eventStatus = "Payment Sprint 2";
            this.gaugeValue = 30;
            this.pointers = [{
                value: 10,
                color: '#d9534f'
            }, {
                value: 40,
                color: '#449d44'
            }, {
                value: 30,
                color: '#ff891e'
            }];
            this.goalGaugeValue = 4675;            
            this.goalGauge = [[this.goalGaugeValue]];
            localStorage.setItem("EventStatus", this.eventStatus);
            this.router.navigate(['/adminevent']);
        }, 3000);
    }

    PaymentNowSubmit() {
        this.submitted = true;
        setTimeout(() => {
            this.paymentNowModal.hide();
            this.submitted = false;
            this.eventStatus = "Paid";
            this.gaugeValue = 32;
            this.pointers = [{
                value: 10,
                color: '#d9534f'
            }, {
                value: 42,
                color: '#449d44'
            }, {
                value: 32,
                color: '#ff891e'
            }];
            this.goalGaugeValue = 4921;            
            this.goalGauge = [[this.goalGaugeValue]];
            localStorage.setItem("EventStatus", this.eventStatus);            
        }, 3000);
    }



    validateNumber(evt: any, length: number, is_couples: boolean = true){
        var val = evt.target.value;
        val = this.NumericPattern(val).substr(0, length);
        evt.target.value = val;
        if(is_couples){
            this.amount = (val ? parseInt(val) : 0) * this.hotel_event_detail.PricePerCouple;
        }
        

    }

    

    validateAmountNumber(evt: any){
        var val = evt.target.value;
        val = this.NumericPattern(val).substr(0, 14);
        evt.target.value = val;
    }

    NumericPattern(value:any){
        var pattern = /[0-9]/;
        var val = '';
        if(value){
          for(var i=0; i<value.length; i++){
            if(value[i].match(pattern)){
              val = val+value[i];
            }
          }
        }
        return val;
    }

    changeEventStatus(status: string) {
        this.appService.sendApprovedEmail(this.eventDetails.eventName).subscribe((data: {}) => {

        });
        localStorage.setItem("EventStatus", status);
        this.eventStatus = status;
    }

    inviteAttendeeUser() {
        this.appService.sendInvitationEmail(this.eventDetails.eventName).subscribe((data: {}) => {

        });
        this.inviteAttendee.hide();
        //localStorage.setItem("EventStatus", "Payment");
        //this.eventStatus = "Payment";
    }

    downloadHotel() {
        window.location.href = '/assets/calendar/hotel.ics?param=x';
    }

    downloadVenue() {
        window.location.href = '/assets/calendar/venue.ics?param=x';
    }

    getAttendeesCount() {
        this.eventDetails["attendees"].totalCount = this.eventDetails["attendees"].names.length;
        this.eventDetails["attendees"].paidCount = this.eventDetails["attendees"].names.filter(i => i.hasPaid === true).length;
        this.eventDetails["attendees"].AdminNames = this.eventDetails["attendees"].names.filter(i => i.isAdmin === true);        
    }

    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    pay_now(){

        if(this.loading){
            return;
        }
        this.loading = true;

        var InvitedDealId = localStorage.getItem('InvitedDealId');
        var User: any = localStorage.getItem("User");
        User = JSON.parse(User);
        var post = {
            "DealID": InvitedDealId,
            "ContactID": User.id,
            "Status": "Paid"
        }

        this.appService.Post("/api/Zoho/DealInviteByID", post)
        .subscribe((data: any) => {
            this.makePayment();
        },
            (err: HttpErrorResponse) => {
                this.makePayment();
            }
        );
        
    }

    makePayment(){
        var User: any = localStorage.getItem("User");
        User = JSON.parse(User);

        var pay = {
            "ProposalID": this.hotel_event_detail.ProposalID,
            "ContactID": User.id,
            "TransactionID": this.makeid(10).toUpperCase(),
            "TransactionStatus": "success",
            "Amount": this.amount
        };

        this.appService.Post("/api/Zoho/SaveProposalTransaction", pay)
        .subscribe(data => {
            this.loading = false;
            this.payment_success();
        },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
                this.payment_success();
            }
        );
    }

    payment_success(){

        var amount = 0;
        if(this.IsAdmin){
            amount = this.amount
        }
        const dialogRef = this.dialog.open(PaymentSuccessComponentDialog, {
            width: '40%',
            maxHeight: '80%',
            disableClose: true
        });
        dialogRef.componentInstance.title = 'Success';
        dialogRef.componentInstance.message = 'Chapter contribution is required';
        dialogRef.componentInstance.total_couples = this.couples;
        dialogRef.componentInstance.amount = this.amount;
        dialogRef.componentInstance.IsAdmin = this.IsAdmin;
    }

    sendInvites(){
        if(this.fruits.length > 0 || this.fruitCtrl.value){
            var AdminEventData: any = localStorage.getItem('AdminEventData');
            if(!AdminEventData){
                return;
            }

            // if(this.fruits.length == 0){
                this.fruits.push(this.fruitCtrl.value);
            // }
            AdminEventData = JSON.parse(AdminEventData);
            var post_data = {
                "DealID": AdminEventData.DealID,
                "DealName": AdminEventData.DealName,
                "Emails": this.fruits
            };

            this.fruitInput.nativeElement.value = '';
            
            this.loading = true;
            this.appService.Post("api/Zoho/InviteAttendees", post_data)
            .subscribe(data => {
                console.log(data);
                setTimeout(() => {
                    this.fruits = [];
                    this.fruitCtrl.setValue('');
                    this.fruitInput.nativeElement.value = '';
                    this.loading = false;
                }, 500);
            },
                (err: HttpErrorResponse) => {
                    this.fruits = [];
                    this.fruitCtrl.setValue('');
                    this.fruitInput.nativeElement.value = '';
                    this.loading = false;
                }
            );
        }
    }
}





@Component({
    selector: 'payment-success-component',
    templateUrl: 'payment_success.component.html',
    styleUrls: ['./payment.component.css']
  })
  export class PaymentSuccessComponentDialog {

    title: string;
    message: string;
    amount: any = '';
    total_couples: any = '';
    IsAdmin: Boolean = false;

    constructor(public dialogRef: MatDialogRef<PaymentSuccessComponentDialog>, private router: Router) {

    }

    CloseModal(){
        this.dialogRef.close(null);
        // [routerLink]="['/payment']"
        this.router.navigate(['events']);
    }

}