import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs'
import { Router } from '@angular/router';
import { Select2OptionData } from 'ng-select2';
import { Options } from 'select2';
import { ICityResponse, IDestinations, DestinationItem } from './city.class';
import { switchMap, debounceTime } from 'rxjs/operators';
import { AppService } from '../services/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
    public exampleData: Array<Select2OptionData>;
    public options: Options;
    hotelForm: FormGroup;
    minStartDate = new Date();
    maxStartDate = new Date();
    minEndDate = new Date();
    maxEndDate = new Date(); 

    minDate = new Date(); 

    startDate: any;
    destinations: Observable<IDestinations>;    
    cities: Observable<ICityResponse>;

    current_index: number = 1;

    destinationNotSureYet: boolean = false;
    startDateNotSureYet: boolean = false;
    endDateNotSureYet: boolean = false;
    attendeeNotSureYet: boolean = false;
    
    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private toastr: ToastrService) { }
    ngOnInit() {
        // search form group
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
            this.hotelForm.patchValue({
                cityInput: sessionObject.cityInput,
                startDate: new Date(sessionObject.startDate),
                endDate: new Date(sessionObject.endDate),
                eventDate: new Date(sessionObject.eventDate),
                attendance: sessionObject.attendance
            });

            this.minDate.setDate(this.minDate.getDate() + 60);
            this.minEndDate.setDate(this.minDate.getDate() + 62);

        }  else{
            var start_date = new Date();
            var end_date = new Date();
            start_date.setDate(start_date.getDate() + 60);
            end_date.setDate(end_date.getDate() + 62);
    
            this.hotelForm.controls.startDate.setValue(start_date);
            this.hotelForm.controls.endDate.setValue(end_date);

            this.minDate.setDate(this.minDate.getDate() + 60);
            this.minEndDate.setDate(this.minDate.getDate() + 62);
        }

        /// destination filter from json
        this.destinations = this.hotelForm.get('cityInput').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: value }, 1)));

        this.destinations = this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: "" }, 1);

        /// Set start and end date maximum date
        // this.maxStartDate.setMonth(this.maxStartDate.getMonth() + 100);        
        // this.maxEndDate.setMonth(this.maxEndDate.getMonth() + 100);        
        // this.maxEndDate.setDate(this.maxStartDate.getDate() + 2);
        
        
        localStorage.removeItem("ConfirmDetailVenueID");
        localStorage.removeItem("ConfirmDetailHotelID");

    }

    /// show selected destination name in autocomplete
    displayFn(city: DestinationItem) {
        if (city) { return city.description; }
    }

    getValue(value) {
        console.log(value);
    }

    changeIndex(index: number) {
        this.current_index = index;
    }

    validateDestination(index: number) {
        if (this.destinationNotSureYet) {
            //this.router.navigate(['/contact-us']);
            window.location.href = "https://formalbuilder.com/#freequote";
        }
        else {
            if (this.hotelForm.value.cityInput == '') {
                this.toastr.error("Please select destination.", "Error");
            }
            else {
                this.current_index = index;
            }
        }
    }

    validateStartEndDate(index: number) {
        if (this.startDateNotSureYet || this.endDateNotSureYet || this.destinationNotSureYet) {
            //this.router.navigate(['/contact-us']);
            window.location.href = "https://formalbuilder.com/#freequote";
        }
        else {
            if (this.hotelForm.value.startDate == '') {
                this.toastr.error("Please enter start date.", "Error");
            }
            else if (this.hotelForm.value.endDate == '') {
                this.toastr.error("Please enter end date.", "Error");
            }
            else {
                this.current_index = index;
            }
        }
    }

    /// Set end date when start date change    
    startDateChange(date: any) {        
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
    endDateChange(date: any) {
        var endDate = new Date(date.value);        
    }

    /// start building
    StartBuilding(hotelForm: FormGroup) {
        if (!this.destinationNotSureYet && !this.startDateNotSureYet && !this.endDateNotSureYet && !this.attendeeNotSureYet) {
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
        else {
            //this.router.navigate(['/contact-us']);
            window.location.href = "https://formalbuilder.com/#freequote";
        }
    }
}
