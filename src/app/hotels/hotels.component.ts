import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelInterface, IHotelList, IExploreDiscovery, IExploreProduct, IExportProductContent, GoogleAPIResponse } from './hotel.class';
import { HotelFilterModel } from './filter.class';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { Observable } from 'rxjs'
import { Router, NavigationStart } from '@angular/router';
import { switchMap, debounceTime } from 'rxjs/operators';
import { City, ICityResponse, IDestinations, DestinationItem } from '../home/city.class';
import { } from 'googlemaps';
import { geometry } from '@progress/kendo-drawing';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-hotels',
    templateUrl: './hotels.component.html',
    styleUrls: ['./hotels.component.css']
})

export class HotelsComponent implements OnInit {
    destinations: Observable<IDestinations>;
    hotels: HotelInterface[];
    selectedHotels: number;
    hotelData: IHotelList;
    hotelDataBackup: HotelInterface[];
    hotelForm: FormGroup;
    searchForm: FormGroup;
    hotelFilterModel: HotelFilterModel;
    regionName: string;
    
    startDate: any;
    endDate: any;
    sortBy = 1;
    layout = 2;
    loading: boolean = false;
    private gmapElement: ElementRef;
    @ViewChild('gmap') set content(content: ElementRef) {
        this.gmapElement = content;
        if (this.gmapElement != undefined) {
            this.loadMap();
        }
    }
    map: google.maps.Map;
    latitude: number;
    longitude: number;
    contentString: string = "";
    infowindow = new google.maps.InfoWindow({
        content: this.contentString
    });  
    date = new Date();
    minDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minEndDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minFromDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minToDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxFromDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxToDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());

    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private globalService: GlobalService, private toastr: ToastrService) {
        this.hotels = this.hotelDataBackup = [];
    }

    reviewOptions: any[] = [{ id: 1, Option: 'Best Reviews' }, { id: 2, Option: 'Price (Low-High)' }, { id: 3, Option: 'Price (High-Low)' }];
    priceFilterOptions: any[] = [{ id: 1, Option: '$' }, { id: 2, Option: '$$' }, { id: 3, Option: '$$$' }];
    ratingFilterOptions: any[] = [{ id: 5, Option: '5 Star' }, { id: 4, Option: '4 Star' }, { id: 3, Option: '3 Star' }, { id: 2, Option: '2 Star' }, { id: 1, Option: '1 Star' }];

    ngOnInit() {
        if (this.globalService.CurrentIndex < 1) {
            this.globalService.CurrentIndex = 1;
        }
        this.selectedHotels = 0;
        // hotel form group
        this.hotelForm = this.fb.group({
            cityInput: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            eventDate: [''],
            attendance: ['', Validators.compose([Validators.required, Validators.max(500)])]
        });

        // search form group
        this.searchForm = this.fb.group({
            rating1: false,
            rating2: false,
            rating3: false,
            rating4: false,
            rating5: false,
            price1: false,
            price2: false,
            price3: false,
            price4: false,
            price5: false
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

            this.appService.Get("/API/Zoho/GetRegionById/" + sessionObject.cityInput)
                .subscribe(data => {
                    var responnse = data as DestinationItem;
                    this.regionName = responnse.description;
                    this.GetRegionLatLng(this);
                },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
            
            this.minDate.setDate(this.minDate.getDate() + 60);
            this.minEndDate.setDate(this.minDate.getDate() + 62);
            console.log(this.minEndDate)
        }
        
        /// destination filter from json
        this.destinations = this.hotelForm.get('cityInput').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: value }, 1)));

        this.destinations = this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: "" }, 1);

        this.LoadHotel();

        this.maxFromDate.setMonth(this.maxFromDate.getMonth() + 100);
        this.maxFromDate.setDate(this.maxFromDate.getDate() + 7);
        this.maxToDate.setMonth(this.maxToDate.getMonth() + 100);
        this.maxToDate.setDate(this.maxToDate.getDate() + 9);

        localStorage.removeItem("ConfirmDetailVenueID");
        localStorage.removeItem("ConfirmDetailHotelID");
    }

    getAllErrors(form: FormGroup | FormArray): { [key: string]: any; } | null {
        let hasError = false;
        const result = Object.keys(form.controls).reduce((acc, key) => {
            const control = form.get(key);
            const errors = (control instanceof FormGroup || control instanceof FormArray)
                ? this.getAllErrors(control)
                : control.errors;
            if (errors) {
                acc[key] = errors;
                hasError = true;
            }
            return acc;
        }, {} as { [key: string]: any; });
        return hasError ? result : null;
    }

    GetRegionLatLng($this) {
        var geocoder = new google.maps.Geocoder();
        var address = this.regionName;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $this.latitude = results[0].geometry.location.lat();
                $this.longitude = results[0].geometry.location.lng();
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
    
    LoadHotel() {
        this.loading = true;
        this.hotels = [];
        this.hotelDataBackup = [];
        var sessionValue = localStorage.getItem("StartBuilding");
        if (sessionValue != '' && sessionValue != undefined) {
            var sessionObject = JSON.parse(sessionValue);
        }
        var hotelSearch = localStorage.getItem("HotelSearch");
        if (hotelSearch != '' && hotelSearch != undefined) {
            this.searchForm.setValue(JSON.parse(hotelSearch));
        }
        var hotelSortBy = localStorage.getItem("HotelSortBy");
        if (hotelSortBy != '' && hotelSortBy != undefined) {
            this.sortBy = parseInt(hotelSortBy);
        }
        if (sessionObject == undefined) {
            this.router.navigate(['/home']);
        }
        else {
            var model = {
                data: {
                    merchandiseType: {
                        key: 3,
                        description: "Accommodation"
                    },
                    startDate: sessionObject.startDate,
                    endDate: sessionObject.endDate,
                    travellers: [
                        {
                            lastName: "Adult 1",
                            age: {
                                key: "-1",
                                description: "Adult"
                            }
                        }
                    ],
                    region: {
                        key: sessionObject.cityInput
                    },
                    unitsNeeded: 1,
                    resultLanguage: "EN",
                    attendance: sessionObject.attendance
                }
            };
            var zohoModel = {
                DestinationID: sessionObject.cityInput,
                TotalAttendee: sessionObject.attendance,
                FromDate: sessionObject.startDate,
                ToDate: sessionObject.endDate
            };
            this.appService.Post("/api/Zoho/GetHotels", zohoModel)
            .subscribe(data => {
                this.hotels = this.hotelDataBackup = data as HotelInterface[];
                this.onSearch(this.searchForm);
                this.loading = false;                
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
        }
    }    

    loadMap() {
        if (this.gmapElement != undefined) {
            var mapProp = {
                center: new google.maps.LatLng(this.latitude, this.longitude),
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
            this.hotels.forEach(obj => {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(obj.Latitude, obj.Longitude),
                    map: this.map,
                    title: obj.HotelName,
                    // router: this.router,
                    icon: ' ',
                    label: {
                        fontFamily: 'Fontawesome',
                        text: '\uf041',
                        fontSize: '32px',
                        color: '#FB6100'
                    }
                });

                marker.addListener('click', function () {
                    var result = obj;
                    var infowindow = new google.maps.InfoWindow();
                    var content = '<div id="content" > ' +
                        '<div class="col-lg-12 col-sm-12 col-xs-12">' +
                        '<div class="thumbnail deals packagesPage hotelgrid">' +
                        '<div class="hotelImage" style="background-image: url(' + obj.PrimaryImage + ')">' +
                        '<a href="javascript:void(0);" class="pageLink"></a>' +
                        '<div class="discountInfo">' +
                        '<ul class="list-inline star homePage"><li>' +
                        obj.HotelStar + ' Star Hotel' +
                        '</li></ul>' +
                        '<ul class="list-inline rating homePage">';
                    for (let i = 0; i < obj.ReviewStar; i++) {
                        content += '<li><i class="fa fa-circle" aria-hidden="true"></i></li>';
                    }
                    for (let i = 0; i < 5 - obj.ReviewStar; i++) {
                        content += '<li><i class="fa fa-circle-o" aria-hidden="true"></i></li>';
                    }
                    content += '</ul>' +
                        '<ul class="list-inline dates"><li>' + obj.NoOfReviews + ' Reviews</li></ul>' +
                        '</div>' +
                        '</div>' +
                        '<div class="caption">' +
                        '<h4><a href="single-package-left-sidebar.html" class="captionTitle">' + obj.HotelName + '</a></h4>' +
                        '<p>' + obj.Address + '</p>' +
                        '<hr />' +
                        '<div class="detailsInfo">' +
                        '<div class="text-left"><b>Starting From</b></div>' +
                        '<h5 style="float:left; padding-top: 10px;">$' + obj.Price + '<span style="float: right; font-size: 16px; color: gray; padding-left: 10px;">Per Couple</span></h5>' +                        
                        '<ul class="list-inline detailsBtn">' +
                        '<li class="left"><a href="javascript:void(0);" class="btn buttonTransparent btnLearnMore learn-more">Learn More</a></li>' +
                        '<li class="right"><a class="btn buttonTransparent btnSelectHotel selection">Select Hotel</a></li></ul>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    infowindow.setContent(content);
                    infowindow.setPosition(marker.getPosition());
                    // infowindow.open(this.map);

                    google.maps.event.addListener(infowindow, 'domready', (event) => {
                        const el = document.querySelector('.btnSelectHotel');
                        el.addEventListener('click', (event) => {
                            localStorage.setItem("Hotel", JSON.stringify(obj));
                            // this.router.navigate(['/venues']);
                        });

                        const el2 = document.querySelector('.btnLearnMore');
                        el2.addEventListener('click', (event) => {
                            localStorage.setItem("Hotel", JSON.stringify(obj));
                            // this.router.navigate(['/hotel-detail']);
                        });

                        const el3 = document.querySelector('.pageLink');
                        el3.addEventListener('click', (event) => {
                            localStorage.setItem("Hotel", JSON.stringify(obj));
                            // this.router.navigate(['/hotel-detail']);
                        });
                    });
                });
            });

        }
    }

    /// Function for show rating star
    counter(i: number) {
        return new Array(i);
    }

    onChangeLayout(i: number) {
        this.layout = i;
    }

    /// change search
    changeSearch(hotelForm: FormGroup) {
        localStorage.setItem("StartBuilding", JSON.stringify(hotelForm.value));

        this.LoadHotel();
    }

    onSelectHotel(hotel: any, isSelected: boolean) {
        //localStorage.setItem("Hotel", JSON.stringify(hotel));
        this.globalService.CurrentIndex = 1;

        this.selectedHotels = this.hotels.filter(x => x.Selected).length;
        if (this.selectedHotels == 3 && isSelected) {
            this.toastr.error("You can select maximum 3 hotels, Please unselect previous selected hotel to select new one.", "Error");
            return;
        }
        for (let oldHotel of this.hotels) {
            if (oldHotel.ID == hotel.ID) {
                oldHotel.Selected = isSelected;
                break;
            }
        }
        this.selectedHotels = this.hotels.filter(x => x.Selected).length;
        //this.router.navigate(['/venues']);
    }

    GoToVenue() {
        var selected = this.hotels.filter(x => x.Selected)
        localStorage.setItem("Hotel", JSON.stringify(selected));
        this.router.navigate(['/venues']);
    }

    onHotelDetail(hotel: any) {
        localStorage.setItem("Hotel", JSON.stringify(hotel));
        this.router.navigate(['/hotel-detail']);
    }

    //Get hotel rating count
    GetHotelRatingCount(hotelStar: number) {
        return this.hotelDataBackup.filter(x => x.HotelStar == hotelStar).length;
    }

    /// Seach function 
    onSearch(searchForm: FormGroup) {
        this.hotels = this.hotelDataBackup;
        /// Search by rating
        if (searchForm.value.rating1 || searchForm.value.rating2 || searchForm.value.rating3 || searchForm.value.rating4 || searchForm.value.rating5) {
            this.hotels = this.hotels.filter(items =>
                (searchForm.value.rating1 ? (items.HotelStar == 1) : false) ||
                (searchForm.value.rating2 ? (items.HotelStar == 2) : false) ||
                (searchForm.value.rating3 ? (items.HotelStar == 3) : false) ||
                (searchForm.value.rating4 ? (items.HotelStar == 4) : false) ||
                (searchForm.value.rating5 ? (items.HotelStar == 5) : false))
        }
        /// Search by price
        if (searchForm.value.price1 || searchForm.value.price2 || searchForm.value.price3 || searchForm.value.price4 || searchForm.value.price5) {
            this.hotels = this.hotels.filter(items =>
                (searchForm.value.price1 ? items.PriceRating == "$" : false) ||
                (searchForm.value.price2 ? items.PriceRating == "$$" : false) ||
                (searchForm.value.price3 ? items.PriceRating == "$$$" : false))
        }
        localStorage.setItem("HotelSearch", JSON.stringify(searchForm.value));
        this.onSort(this.sortBy);
        this.loadMap();
    }

    /// Seach function 
    onPriceFilterSearch(pricings: any[]) {
        this.hotels = this.hotelDataBackup;
        if (pricings.length > 0) {
            this.hotels = this.hotels.filter(items => pricings.indexOf(items.PriceRating) > -1 ? true : false);
        }
        this.onSort(this.sortBy);
        this.loadMap();
    }

    onRatingFilterSearch(ratings: any[]) {
        this.hotels = this.hotelDataBackup;
        if (ratings.length > 0) {
            this.hotels = this.hotels.filter(items => ratings.indexOf(items.HotelStar) > -1 ? true : false);
        }
        this.onSort(this.sortBy);
        this.loadMap();
    }

    /// Sorting function
    onSort(sortBy: any) {
        this.sortBy = sortBy;
        localStorage.setItem("HotelSortBy", this.sortBy.toString());
        switch (this.sortBy) {
            case 1:
                this.hotels.sort(function (a, b) { return a.ReviewStar < b.ReviewStar ? 2 : a.ReviewStar > b.ReviewStar ? -2 : a.NoOfReviews < b.NoOfReviews ? 1 : a.NoOfReviews > b.NoOfReviews ? -1 : 0 });
                break;
            case 2:
                this.hotels.sort(function (a, b) { return a.Price > b.Price ? 1 : a.Price < b.Price ? -1 : 0 });
                break;
            case 3:
                this.hotels.sort(function (a, b) { return a.Price < b.Price ? 1 : a.Price > b.Price ? -1 : 0 });
                break;
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

    /// show selected destination name in autocomplete
    displayFn(city: DestinationItem) {
        if (city) { return city.description; }
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
