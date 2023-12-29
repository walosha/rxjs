import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs'
import { switchMap, debounceTime } from 'rxjs/operators';
import { } from 'googlemaps';
import { HotelInterface } from '../hotels/hotel.class';
import { IDestinations } from '../home/city.class';

@Component({
    selector: 'app-hotel-detail',
    templateUrl: './hotels-detail.component.html',
    styleUrls: ['./hotels-detail.component.css']
})

export class HotelDetailComponent implements OnInit {
    destinations: Observable<IDestinations>;
    hotelDetail: HotelInterface;
    hotelDetails: any;
    Arr = Array;
    hotelForm: FormGroup;
    constructor(private fb: FormBuilder, protected router: Router, private httpClient: HttpClient, private appService: AppService, private globalService: GlobalService) { }
    date = new Date();
    minDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minEndDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minFromDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minToDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxFromDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxToDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    background = '';
    CheckInDate: any;
    CheckOutDate: any;
    buttonText: string = "Select Hotel";
    private gmapElement: ElementRef;
    loading: boolean = false;
    @ViewChild('gmap') set content(content: ElementRef) {
        this.gmapElement = content;
        this.loadMap();
    }
    map: google.maps.Map;

    ngOnInit() {
        // hotel form group
        this.hotelForm = this.fb.group({
            cityInput: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            eventDate: [''],
            attendance: ['', Validators.compose([Validators.required, Validators.max(500)])]
        });
        
        var sessionValue = localStorage.getItem("StartBuilding");
        if (sessionValue != '' && sessionValue != undefined) {
            var sessionObject = JSON.parse(sessionValue);
            var eventDate = new Date(sessionObject.startDate);
            eventDate.setDate(eventDate.getDate() + 1);
            this.hotelForm.patchValue({
                cityInput: sessionObject.cityInput,
                startDate: new Date(sessionObject.startDate),
                endDate: new Date(sessionObject.endDate),
                eventDate: eventDate,
                attendance: sessionObject.attendance
            });  
            this.CheckInDate = new Date(sessionObject.startDate);
            this.CheckOutDate = new Date(sessionObject.endDate);
            
            this.minDate.setDate(this.minDate.getDate() + 60);
            this.minEndDate.setDate(this.minDate.getDate() + 62);
            console.log(this.minEndDate)
        }

        /// destination filter from json
        this.destinations = this.hotelForm.get('cityInput').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: value }, 1)));

        this.destinations = this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: "" }, 1);

        var hotel = localStorage.getItem("Hotel");
        if (!(hotel != '' && hotel != undefined)) {
            this.router.navigate(['/hotels']);
        }
        this.loading = true;
        this.hotelDetail = JSON.parse(hotel) as HotelInterface;
        this.appService.Get("/API/Zoho/GetHotelDetail?hotelId=" + this.hotelDetail.ID)
            .subscribe(data => {
                this.hotelDetail = data as HotelInterface;
                this.loading = false;
                this.loadMap();
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
        var confirmDetailHotelId = localStorage.getItem("ConfirmDetailHotelID");
        if (this.hotelDetail.ID.toString() === confirmDetailHotelId) {
            this.buttonText = "Return to Quote";
        }
        
                
        /// Set start and end date maximum date
        this.maxFromDate.setMonth(this.maxFromDate.getMonth() + 100);
        this.maxFromDate.setDate(this.maxFromDate.getDate() + 7);
        this.maxToDate.setMonth(this.maxToDate.getMonth() + 100);
        this.maxToDate.setDate(this.maxToDate.getDate() + 9); 
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

    redefineSearch(hotelForm: FormGroup) {
        localStorage.setItem("StartBuilding", JSON.stringify(hotelForm.value));
        localStorage.removeItem('Hotel');
        localStorage.removeItem('Venue');
        localStorage.removeItem('VenueSearch');
        localStorage.removeItem('VenueSortBy');
        localStorage.removeItem('HotelSearch');
        localStorage.removeItem('HotelSortBy');
        localStorage.removeItem('ConfirmDetail');
        this.router.navigate(['/hotels']);
    }

    loadMap() {
        if (this.hotelDetail != null && this.gmapElement != undefined) {
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
        }
    }

    onSelectHotel(hotel: any) {
        localStorage.setItem("Hotel", JSON.stringify(hotel));
        if (this.buttonText == "Select Hotel") {
            this.globalService.CurrentIndex = 1;
            this.router.navigate(['/venues']);
        }
        else {
            this.router.navigate(['/confirm']);
        }
    }

    /// From date change function
    fromDateChange(date: any) {
        var startDate = new Date(date.value);
        var endDate = new Date(date.value);
        var eventDate = new Date(date.value);

        this.hotelForm.patchValue({
            startDate: startDate,
            eventDate: new Date(eventDate.setDate(eventDate.getDate() + 1)),
            endDate: new Date(endDate.setDate(endDate.getDate() + 2))
        });
        this.minEndDate = endDate;
    }
    /// to date change function
    toDateChange(date: any) {
        var endDate = new Date(date.value);
        //this.maxFromDate = endDate;
        //this.minEndDate = endDate;
    }

    counter(i: number) {
        return new Array(i);
    }

    goToHotel() {
        if (this.globalService.CurrentIndex >= 1) {
            this.router.navigate(['/hotels']);
        }
    }

    goToVenue() {
        if (this.globalService.CurrentIndex >= 2) {
            this.router.navigate(['/venues']);
        }
    }

    goToConfirm() {
        if (this.globalService.CurrentIndex >= 3) {
            this.router.navigate(['/confirm']);
        }
    }
}
