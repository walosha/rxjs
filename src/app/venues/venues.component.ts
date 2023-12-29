import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueInterface, IVenueList } from './venue.class';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { Observable } from 'rxjs'
import { Router } from '@angular/router';
import { switchMap, debounceTime } from 'rxjs/operators';
import { City, ICityResponse, IDestinations, DestinationItem } from '../home/city.class';
import { } from 'googlemaps';
import { IHotelList, HotelInterface, IExploreDiscovery, IExploreProduct, IExportProductContent, GoogleAPIResponse, GooglePlaceAPIResponse } from '../hotels/hotel.class';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-venues',
    templateUrl: './venues.component.html',
    styleUrls: ['./venues.component.css']
})

export class VenuesComponent implements OnInit {
    destinations: Observable<IDestinations>;
    hotel: HotelInterface;
    venues: VenueInterface[];
    selectedVenues: number;
    venueData: IVenueList;
    venueDataBackup: VenueInterface[];
    regionName: string;
    searchForm: FormGroup;
    hotelForm: FormGroup;
    date = new Date();
    minDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minEndDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minFromDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    minToDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxFromDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    maxToDate = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    loading: boolean = false;
    fromDate;
    toDate;
    sortBy = 1;
    layout = 2;
    private gmapElement: ElementRef;
    @ViewChild('gmap') set content(content: ElementRef) {
        this.gmapElement = content;
        if (this.gmapElement != undefined) {
            this.loadMap();
        }
    }
    map: google.maps.Map;
    reviewOptions: any[] = [{ id: 1, Option: 'Best Reviews' }, { id: 2, Option: 'Price (Low-High)' }, { id: 3, Option: 'Price (High-Low)' }];
    priceFilterOptions: any[] = [{ id: 1, Option: '$' }, { id: 2, Option: '$$' }, { id: 3, Option: '$$$' }];
    ratingFilterOptions: any[] = [{ id: 5, Option: '5 Star' }, { id: 4, Option: '4 Star' }, { id: 3, Option: '3 Star' }, { id: 2, Option: '2 Star' }, { id: 1, Option: '1 Star' }];

    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private globalService: GlobalService, private toastr: ToastrService) {
        this.venues = this.venueDataBackup = [];
    }

    ngOnInit() {
        if (this.globalService.CurrentIndex < 2) {
            this.globalService.CurrentIndex = 2;
        }
        this.selectedVenues = 0;
        // hotel form group
        this.hotelForm = this.fb.group({
            cityInput: ['', Validators.required],
            startDate: [''],
            endDate: [''],
            eventDate: ['', Validators.required],
            attendance: ['', Validators.compose([Validators.required, Validators.max(500)])]
        });

        // search form group
        this.searchForm = this.fb.group({
            price1: false,
            price2: false,
            price3: false,
            price4: false,
            price5: false,
            capacity1: false,
            capacity2: false,
            capacity3: false,
            capacity4: false,
            capacity5: false,
            rating1: false,
            rating2: false,
            rating3: false,
            rating4: false,
            rating5: false,
            FoodAvailable: false
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
            console.log(this.minEndDate)

            this.appService.Get("/API/Zoho/GetRegionById/" + sessionObject.cityInput)
                .subscribe(data => {
                    var responnse = data as DestinationItem;
                    this.regionName = responnse.description;
                },
                    (err: HttpErrorResponse) => {
                        console.log(err.message);
                        this.loading = false;
                    }
                );
        }

        /// destination filter from json        
        this.destinations = this.hotelForm.get('cityInput').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: value }, 1)));

        this.destinations = this.appService.searchDestination({ url: "api/Zoho/GetRegions", name: "" }, 1);

        var hotel = localStorage.getItem("Hotel");
        if (!(hotel != '' && hotel != undefined)) {
            this.router.navigate(['/hotels']);
        }
        this.hotel = JSON.parse(hotel) as HotelInterface;

        this.LoadVenue();

        this.maxFromDate.setMonth(this.maxFromDate.getMonth() + 100);
        this.maxFromDate.setDate(this.maxFromDate.getDate() + 7);
        this.maxToDate.setMonth(this.maxToDate.getMonth() + 100);
        this.maxToDate.setDate(this.maxToDate.getDate() + 9);

        localStorage.removeItem("ConfirmDetailVenueID");
        localStorage.removeItem("ConfirmDetailHotelID");
    }

    LoadVenue() {
        this.loading = true;
        var sessionValue = localStorage.getItem("StartBuilding");
        if (sessionValue != '' && sessionValue != undefined) {
            var sessionObject = JSON.parse(sessionValue);
        }
        var venueSearch: any = localStorage.getItem("VenueSearch");
        if (venueSearch != '' && venueSearch != undefined) {
            var venueSearchModel = JSON.parse(venueSearch);
            if (venueSearchModel.FoodAvailable == undefined) {
                venueSearchModel.FoodAvailable = false;
            }
            this.searchForm.setValue(venueSearchModel);
        }
        var venueSortBy = localStorage.getItem("VenueSortBy");
        if (venueSortBy != '' && venueSortBy != undefined) {
            this.sortBy = parseInt(venueSortBy);
        }
        if (sessionObject == undefined) {
            this.router.navigate(['/home']);
        }
        else {
            var model = {
                data: {
                    merchandiseType: {
                        key: 15,
                        description: "Activity"
                    },
                    startDate: sessionObject.startDate,
                    startTime: "09:00",
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
                    resultLanguage: "EN",
                    HotelPlaceID: this.hotel.PlaceID,
                    attendance: sessionObject.attendance
                }
            };

            var zohoModel = {
                DestinationID: sessionObject.cityInput,
                TotalAttendee: sessionObject.attendance,
                FromDate: sessionObject.startDate,
                ToDate: sessionObject.endDate,
                PlaceID: this.hotel.PlaceID
            };

            this.appService.Post("/API/Zoho/GetVenues", zohoModel)
                .subscribe(data => {
                    this.venues = this.venueDataBackup = data as VenueInterface[];
                    this.onSearch(this.searchForm);
                    this.loading = false;
                    if (false) {
                        this.venueData = data as IVenueList;

                        var processID = [];
                        this.venueData.data.forEach(obj => {
                            if (processID.filter(x => x == obj.facility.key).length == 0) {
                                processID.push(obj.facility.key);
                                this.appService.Get("explore/discovery?facility=" + obj.facility.key + "&lang=EN")
                                    .subscribe(data => {
                                        var facility = data as IExploreDiscovery;
                                        var newHotel = new VenueInterface();
                                        newHotel.ID = obj.facility.key;
                                        newHotel.VenueName = obj.facility.description;
                                        var address = facility.data.address;
                                        if (address != null) {
                                            newHotel.Address = address.street1 + ", " + address.city + ", " + address.state + ", " + address.country + ", " + address.zipcode;
                                        }
                                        newHotel.Description = obj.product.description;
                                        newHotel.SliderImages = facility.data.content;
                                        newHotel.PrimaryImage = facility.data.primaryImage;
                                        newHotel.included = facility.data.included;
                                        newHotel.ProductID = obj.product.key;
                                        newHotel.Available = obj.available;
                                        newHotel.StartDate = obj.startDate;
                                        newHotel.EndDate = obj.endDate;
                                        newHotel.MinCapacity = 50;
                                        newHotel.MaxCapacity = 200;
                                        if (facility.data.primaryImage != undefined && facility.data.primaryImage != null) {
                                            newHotel.ListImage = facility.data.primaryImage.url;
                                        }
                                        var geoCode = facility.data.geoCode.split(',');
                                        newHotel.Latitude = Number(geoCode[0]);
                                        newHotel.Longitude = Number(geoCode[1]);
                                        this.appService.Get("explore/product/" + newHotel.ProductID)
                                            .subscribe(data => {
                                                var product = data as IExploreProduct;
                                                //newHotel.PricePerNight = newHotel.PriceRating + '($' + product.data.fromPrice.amount + ')';
                                                newHotel.DescriptionList = product.data.attributes;
                                                if (product.data.productGroups.length > 0) {
                                                    newHotel.VenueStar = Number(product.data.productGroups[0].description[0]);
                                                }
                                            },
                                                (err: HttpErrorResponse) => {
                                                    console.log(err.message);
                                                }
                                            );

                                        this.appService.Get("explore/product/" + newHotel.ProductID + "/content?include=facility&language=EN")
                                            .subscribe(data => {
                                                var productContent = data as IExportProductContent;
                                                var placeId = productContent.data.filter(x => x.title == "Place_ID");
                                                if (placeId.length > 0) {
                                                    newHotel.PlaceID = placeId[0].body;

                                                    this.appService.Get("/api/GooglePlace/GetPlaceDetail?placeID=" + newHotel.PlaceID)
                                                        .subscribe(data => {
                                                            var googleApi = data as GoogleAPIResponse;
                                                            newHotel.NoOfReviews = googleApi.result.user_ratings_total;
                                                            newHotel.ReviewStar = Math.floor(googleApi.result.rating);
                                                            newHotel.Reviews = googleApi.result.reviews;
                                                        },
                                                            (err: HttpErrorResponse) => {
                                                                console.log(err.message);
                                                            }
                                                        );

                                                    this.appService.GetMap("/api/GooglePlace/GetDirection?sourcePlaceID=" + this.hotel.PlaceID + "&destinationPlaceID=" + newHotel.PlaceID + "&mode=driving")
                                                        .subscribe(data => {
                                                            var googleApi = data as GooglePlaceAPIResponse;
                                                            if (googleApi.rows.length > 0 && googleApi.rows[0].elements.length > 0) {
                                                                newHotel.DistanceToHotel = googleApi.rows[0].elements[0].distance.text;
                                                                newHotel.Driving = googleApi.rows[0].elements[0].duration.text;
                                                            }
                                                        },
                                                            (err: HttpErrorResponse) => {
                                                                console.log(err.message);
                                                            }
                                                        );

                                                    this.appService.GetMap("http://formalbuilderapi.cyberclouds.info/api/GooglePlace/GetDirection?sourcePlaceID=" + this.hotel.PlaceID + "&destinationPlaceID=" + newHotel.PlaceID + "&mode=walking")
                                                        .subscribe(data => {
                                                            var googleApi = data as GooglePlaceAPIResponse;
                                                            if (googleApi.rows.length > 0 && googleApi.rows[0].elements.length > 0) {
                                                                newHotel.Walking = googleApi.rows[0].elements[0].duration.text;
                                                            }
                                                        },
                                                            (err: HttpErrorResponse) => {
                                                                console.log(err.message);
                                                            }
                                                        );
                                                }
                                            },
                                                (err: HttpErrorResponse) => {
                                                    console.log(err.message);
                                                }
                                            );

                                        this.venues.push(newHotel);

                                    },
                                        (err: HttpErrorResponse) => {
                                            console.log(err.message);
                                        }
                                    );
                            }
                        });
                    }
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
                center: new google.maps.LatLng(this.hotel.Latitude, this.hotel.Longitude),
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

            var hotelMarker = new google.maps.Marker({
                position: new google.maps.LatLng(this.hotel.Latitude, this.hotel.Longitude),
                map: this.map,
                title: this.hotel.HotelName,
                // router: this.router,
                icon: ' ',
                label: {
                    fontFamily: 'Fontawesome',
                    text: '\uf041',
                    fontSize: '32px',
                    color: '#FB6100'
                }
            });

            this.venues.forEach(obj => {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(obj.Latitude, obj.Longitude),
                    map: this.map,
                    title: obj.VenueName,
                    // router: this.router,
                    icon: ' ',
                    label: {
                        fontFamily: 'Fontawesome',
                        text: '\uf041',
                        fontSize: '32px',
                        color: '#f725de'
                    }
                });

                marker.addListener('click', function () {
                    var result = obj;
                    var infowindow = new google.maps.InfoWindow();                    
                    var content = '<div id="content" >' +
                        '<div class="col-lg-12 col-sm-12 col-xs-12">' +
                        '<div class="thumbnail deals packagesPage hotelgrid">' +
                        '<div class="hotelImage" style="background-image: url(' + obj.PrimaryImage + ')">';
                    content += '<a href="javascript:void(0);" class="pageLink"></a>' +
                        '<div class="venue discountInfo">' +
                        '<ul class="list-inline rating homePage">';
                    for (let i = 0; i < obj.ReviewStar; i++) {
                        content += '<li><i class="fa fa-circle" aria-hidden="true"></i></li>';
                    }
                    for (let i = 0; i < 5 - obj.ReviewStar; i++) {
                        content += '<li><i class="fa fa-circle-o" aria-hidden="true"></i></li>';
                    }
                    content += '</ul>' +
                        '<ul class="list-inline dates"><li>' + obj.NoOfReviews + ' reviews</li></ul>' +
                        '</div>' +
                        '</div>' +
                        '<div class="caption">' +
                        '<h4 class="text-center"><a href="javascript:void(0);" class="captionTitle">' + obj.VenueName + '</a></h4>' +
                        '<hr />' +
                        '<p class="text-center">Distance from Hotel: ' + obj.DistanceToHotel + '</p>' +
                        '<hr />' +
                        '<div class="detailsInfo">' +                        
                        '<div class="text-left"><b>Starting From</b></div>' +
                        '<h5 style="float:left; padding-top: 10px;">$' + obj.Price + '<span style="float: right; font-size: 16px; color: gray; padding-left: 10px;">Per Couple</span></h5>' +
                        '<ul class="list-inline detailsBtn">' +
                        '<li class="left"><a href="javascript:void(0);" class="btn buttonTransparent btnLearnMore learn-more">Learn More</a></li>' +
                        '<li class="right"><a href="javascript:void(0);" class="btn buttonTransparent btnSelectVenue selection">Select Venue</a></li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    infowindow.setContent(content);
                    infowindow.setPosition(marker.getPosition());
                    // infowindow.open(this.map);

                    google.maps.event.addListener(infowindow, 'domready', (event) => {
                        const el = document.querySelector('.btnSelectVenue');
                        el.addEventListener('click', (event) => {
                            localStorage.setItem("Venue", JSON.stringify(obj));
                            // this.router.navigate(['/confirm']);
                        });

                        const el2 = document.querySelector('.btnLearnMore');
                        el2.addEventListener('click', (event) => {
                            localStorage.setItem("Venue", JSON.stringify(obj));
                            // this.router.navigate(['/venue-detail']);
                        });

                        const el3 = document.querySelector('.pageLink');
                        el3.addEventListener('click', (event) => {
                            localStorage.setItem("Venue", JSON.stringify(obj));
                            // this.router.navigate(['/venue-detail']);
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

    /// change search
    changeSearch(hotelForm: FormGroup) {
        localStorage.setItem("StartBuilding", JSON.stringify(hotelForm.value));
        this.router.navigate(['/hotels']);
        //this.LoadVenue();
    }

    /// Change layout event
    onChangeLayout(i: number) {
        this.layout = i;
    }

    //Get venue rating count
    GetVenueRatingCount(hotelStar: number) {
        return this.venueDataBackup.filter(x => x.VenueStar == hotelStar).length;
    }

    onSelectVenue(venue: any, isSelected: boolean) {
        //localStorage.setItem("Venue", JSON.stringify(venue));
        //this.router.navigate(['/confirm']);

        this.selectedVenues = this.venues.filter(x => x.Selected).length;
        if (this.selectedVenues == 3 && isSelected) {
            this.toastr.error("You can select maximum 3 venues, Please unselect previous selected venue to select new one.", "Error");
            return;
        }
        for (let oldVenue of this.venues) {
            if (oldVenue.ID == venue.ID) {
                oldVenue.Selected = isSelected;
                break;
            }
        }
        this.selectedVenues = this.venues.filter(x => x.Selected).length;
    }

    GoToConfirm() {
        var selected = this.venues.filter(x => x.Selected)
        localStorage.setItem("Venue", JSON.stringify(selected));
        this.router.navigate(['/confirm']);
    }

    onVenueDetail(venue: any) {
        localStorage.setItem("Venue", JSON.stringify(venue));
        this.router.navigate(['/venue-detail']);
    }

    /// Seach function 
    onSearch(searchForm: FormGroup) {
        this.venues = this.venueDataBackup;
        if (searchForm.value.hotelName) {
            this.venues = this.venues.filter(items => (items.VenueName.toLowerCase().toString().includes(searchForm.value.venueName.toLowerCase().toString())));
        }
        /// Search by rating
        if (searchForm.value.rating1 || searchForm.value.rating2 || searchForm.value.rating3 || searchForm.value.rating4 || searchForm.value.rating5) {
            this.venues = this.venues.filter(items =>
                (searchForm.value.rating1 ? (items.ReviewStar == 1) : false) ||
                (searchForm.value.rating2 ? (items.ReviewStar == 2) : false) ||
                (searchForm.value.rating3 ? (items.ReviewStar == 3) : false) ||
                (searchForm.value.rating4 ? (items.ReviewStar == 4) : false) ||
                (searchForm.value.rating5 ? (items.ReviewStar == 5) : false))
        }
        if (searchForm.value.price1 || searchForm.value.price2 || searchForm.value.price3 || searchForm.value.price4 || searchForm.value.price5) {
            this.venues = this.venues.filter(items =>
                (searchForm.value.price1 ? (items.PriceRating == "$") : false) ||
                (searchForm.value.price2 ? (items.PriceRating == "$$") : false) ||
                (searchForm.value.price3 ? (items.PriceRating == "$$$") : false))
        }
        if (searchForm.value.fromDate && searchForm.value.toDate) {
            this.venues = this.venues.filter(items => new Date(items.StartDate) <= new Date(searchForm.value.fromDate) && new Date(items.EndDate) >= new Date(searchForm.value.toDate));
        }
        if (searchForm.value.capacity1 || searchForm.value.capacity2 || searchForm.value.capacity3 || searchForm.value.capacity4) {
            this.venues = this.venues.filter(items =>
                (searchForm.value.capacity1 ? (items.MaxCapacity >= 0 && items.MaxCapacity <= 50) : false) ||
                (searchForm.value.capacity2 ? (items.MaxCapacity >= 50 && items.MaxCapacity < 100) : false) ||
                (searchForm.value.capacity3 ? (items.MaxCapacity >= 100 && items.MaxCapacity < 250) : false) ||
                (searchForm.value.capacity4 ? (items.MaxCapacity >= 250 && items.MaxCapacity < 500) : false) ||
                (searchForm.value.capacity5 ? (items.MaxCapacity >= 500) : false))
        }
        if (searchForm.value.FoodAvailable) {
            this.venues = this.venues.filter(items => items.FoodOptions.length > 0);
        }
        localStorage.setItem("VenueSearch", JSON.stringify(searchForm.value));
        this.onSort(this.sortBy);
        this.loadMap();
    }

    /// Seach function 
    onPriceFilterSearch(pricings: any[]) {
        this.venues = this.venueDataBackup;
        if (pricings.length > 0) {
            this.venues = this.venues.filter(items => pricings.indexOf(items.PriceRating) > -1 ? true : false);
        }
        this.onSort(this.sortBy);
        this.loadMap();
    }

    onRatingFilterSearch(ratings: any[]) {
        this.venues = this.venueDataBackup;
        if (ratings.length > 0) {
            this.venues = this.venues.filter(items => ratings.indexOf(items.VenueStar) > -1 ? true : false);
        }
        this.onSort(this.sortBy);
        this.loadMap();
    }

    /// sort data function
    onSort(sortBy: number) {
        this.sortBy = sortBy;
        localStorage.setItem("VenueSortBy", this.sortBy.toString());
        switch (this.sortBy) {
            case 1:
                this.venues.sort(function (a, b) { return a.ReviewStar < b.ReviewStar ? 2 : a.ReviewStar > b.ReviewStar ? -2 : a.NoOfReviews < b.NoOfReviews ? 1 : a.NoOfReviews > b.NoOfReviews ? -1 : 0 });
                break;
            case 2:
                this.venues.sort(function (a, b) { return a.Price > b.Price ? 1 : a.Price < b.Price ? -1 : 0 });
                break;
            case 3:
                this.venues.sort(function (a, b) { return a.Price < b.Price ? 1 : a.Price > b.Price ? -1 : 0 });
                break;
            case 4:
                this.venues.sort(function (a, b) { return a.Distance < b.Distance ? 1 : a.Distance > b.Distance ? -1 : 0 });
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
