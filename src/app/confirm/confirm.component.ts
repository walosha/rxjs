import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { jqxKnobComponent } from 'jqwidgets-ng/jqxknob';
import { jqxNumberInputComponent } from 'jqwidgets-ng/jqxnumberinput';

import { AppService } from '../services/app.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { HotelInterface } from '../hotels/hotel.class';
import { VenueInterface } from '../venues/venue.class';
import { DestinationItem } from '../home/city.class';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../services/global.service'

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.css']
})

export class ConfirmComponent implements OnInit {
    venues: VenueInterface[];
    hotels: HotelInterface[];
    proposals: any[];
    eventForm: FormGroup;
    filteredUniversities: any;
    filteredOrganizations: any;
    EventDate: any;
    Price: any;
    FoodChoice: number = 0;
    foodChoicePrice: number;
    chapterContribution: number;
    Error: string;
    foodOptions: Array<any[]>;

    loading: boolean = false;
    price_checked: boolean = false;    

    selectedPrice: number = 2;
    priceTable: Array<any>;

    templateList: Array<object> = [];
    price_quote: any = null;
    price_quote_fetched: boolean = false;
    dealId: string = '';

    planTitles: string[] = [];
    planDetails: any = [];
    offsetHeight: number = 0;

    @ViewChild('myKnob', { static: false } as any) myKnob: jqxKnobComponent;
    minValue: number = 2;
    maxValue: number = 500;
    currentValue: number = 5;
    style: any = { stroke: '#dfe3e9', strokeWidth: 3, fill: { color: '#fefefe', gradientType: "linear", gradientStops: [[0, 1], [50, 0.9], [100, 1]] } };
    marks: any = {
        colorRemaining: { color: 'grey', border: 'grey' },
        colorProgress: { color: '#00a4e1', border: '#00a4e1' },
        type: 'line',
        offset: '69%',
        thickness: 2,
        size: '6%',
        majorSize: '7%',
        majorInterval: 10,
        minorInterval: 10,
    };
    labels: any =
        {
            offset: '88%',
            step: (this.maxValue / 100),
            visible: true,
            //customLabels: [{ text: '0', value: 0 },
            //    { text: '5000', value: 50 },
            //    { text: '10000', value: 100 },
            //    { text: '15000', value: 150 },
            //    { text: '20000', value: 200 },
            //    { text: '25000', value: 250 },
            //    { text: '30000', value: 300 },
            //    { text: '35000', value: 350 },
            //    { text: '40000', value: 400 },
            //    { text: '45000', value: 450 },
            //    { text: '50000', value: 500 }],
            formatFunction: function (h) {
                if ((h * 1000) % 100 != 0) {
                    return '';
                }
                return Number((h * 1000).toFixed(0)).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,                    
                    minimumFractionDigits: 0
                });
            }
        };
    progressBar: any =
        {
            style: { fill: '#FE6700', stroke: 'grey' },
            size: '19%', offset: '60%',
            background: { fill: 'grey', stroke: 'grey' }
        };
    pointer: any =
        {
            type: 'arrow', style: { fill: '#FE6700', stroke: 'grey' },
            size: '59%', offset: '49%', thickness: 20
        };

    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private toastr: ToastrService, private globalService: GlobalService) {
        this.foodChoicePrice = 0;
        this.foodOptions = [];
        this.proposals = [];
    }

    ngOnInit() {
        if (this.globalService.CurrentIndex < 3) {
            this.globalService.CurrentIndex = 3;
        }
        // Event form group
        this.eventForm = this.fb.group({
            eventName: [''],
            Destination: ['', Validators.required],
            DestinationId: [''],
            CheckIn: ['', Validators.required],
            CheckOut: ['', Validators.required],
            SecondaryCheckIn: [''],
            EventDate: [''],
            TotalAttendees: ['', Validators.required],
            //amount: ['', Validators.required],
            //university: ['', Validators.required],
            //organization: ['', Validators.required],
            chapterContributions: [''],
            //chapter: ['', Validators.required],
            //chapter2: [''],
            Price: [''],
            FoodChoice: [''],
            SelectedPrice: [2]
        });
        var datePipe = new DatePipe("en-US");
        this.loading = true;
        var sessionValue = localStorage.getItem("StartBuilding");
        if (sessionValue != '' && sessionValue != undefined) {
            var sessionObject = JSON.parse(sessionValue);
            if (sessionObject.eventDate != "" && sessionObject.eventDate != null) {
                this.EventDate = datePipe.transform(new Date(sessionObject.eventDate), 'MM/dd/yyyy');
            }
            else {
                this.EventDate = datePipe.transform(new Date(sessionObject.startDate), 'MM/dd/yyyy');
            }
            this.eventForm.patchValue({
                CheckIn: datePipe.transform(new Date(sessionObject.startDate), 'MM/dd/yyyy'),
                CheckOut: datePipe.transform(new Date(sessionObject.endDate), 'MM/dd/yyyy'),
                TotalAttendees: sessionObject.attendance,
                EventDate: this.EventDate
            });

            this.appService.Get("/API/Zoho/GetRegionById/" + sessionObject.cityInput)
                .subscribe(data => {
                    var responnse = data as DestinationItem;
                    if (responnse) {
                        if (responnse.description) {
                            this.eventForm.patchValue({
                                Destination: responnse.description,
                                DestinationId: responnse.key
                            });
                        }
                    }
                },
                    (err: HttpErrorResponse) => {
                        console.log(err.message);
                    }
                );
        }

        var hotel = localStorage.getItem("Hotel");
        if (!(hotel != '' && hotel != undefined)) {
            this.router.navigate(['/hotels']);
        }
        this.hotels = JSON.parse(hotel) as HotelInterface[];

        var venue = localStorage.getItem("Venue");
        if (!(venue != '' && venue != undefined)) {
            this.router.navigate(['/venues']);
        }
        this.venues = JSON.parse(venue) as VenueInterface[];

        var confirmDetailValue = localStorage.getItem("ConfirmDetail");
        if (confirmDetailValue != '' && confirmDetailValue != undefined) {
            // debugger;
            var confirmDetailObject = JSON.parse(confirmDetailValue);
            if (confirmDetailObject.EventDate != "" && confirmDetailObject.EventDate != null) {
                this.EventDate = datePipe.transform(new Date(confirmDetailObject.EventDate), 'MM/dd/yyyy');
            }
            else {
                this.EventDate = datePipe.transform(new Date(confirmDetailObject.CheckIn), 'MM/dd/yyyy');
            }
            this.eventForm.patchValue({
                eventName: confirmDetailObject.eventName,
                Destination: confirmDetailObject.Destination,
                CheckIn: datePipe.transform(new Date(confirmDetailObject.CheckIn), 'MM/dd/yyyy'),
                CheckOut: datePipe.transform(new Date(confirmDetailObject.CheckOut), 'MM/dd/yyyy'),
                TotalAttendees: confirmDetailObject.TotalAttendees,
                EventDate: this.EventDate,
                //amount: confirmDetailObject.amount,
                //university: confirmDetailObject.university,
                //organization: confirmDetailObject.organization,
                chapterContributions: confirmDetailObject.chapterContributions,
                //chapter: confirmDetailObject.chapter,
                //chapter2: confirmDetailObject.chapter2,
                Price: confirmDetailObject.Price,
                FoodChoice: confirmDetailObject.FoodChoice,
                SelectedPrice: confirmDetailObject.SelectedPrice
            });
            this.selectedPrice = confirmDetailObject.SelectedPrice;
            this.changeOption(confirmDetailObject.FoodChoice);
        }
        else {
            //if (localStorage.getItem("university") != null && localStorage.getItem("organization") != null) {
            //    this.eventForm.patchValue({
            //        university: localStorage.getItem("university"),
            //        organization: localStorage.getItem("organization")
            //    });
            //}
            this.changeOption(0);
        }



        //this.filteredUniversities = this.eventForm.get('university').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
        //    this.appService.searchUniversity({ url: "api/Zoho/GetUniversities", name: value }, 1)));

        //this.filteredUniversities = this.appService.searchUniversity({ url: "api/Zoho/GetUniversities", name: "" }, 1);

        //this.filteredOrganizations = this.eventForm.get('organization').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
        //    this.appService.searchOrganization({ url: "api/Zoho/GetOrganizations", name: value }, 1)));

        //this.filteredOrganizations = this.appService.searchOrganization({ url: "api/Zoho/GetOrganizations", name: "" }, 1);

        if (!this.eventForm.value['chapterContributions']) {
            this.eventForm.controls.chapterContributions.setValue('5000');
        }
        if (this.eventForm.value['CheckIn']) {
            var date = new Date(this.eventForm.value['CheckIn']);
            date.setDate(date.getDate() + 7);
            this.eventForm.controls.SecondaryCheckIn.setValue(date.toISOString());
        }

        this.dealId = localStorage.getItem("BuildAnotherDealID");
        
        //this.getPriceQuote();
        //this.getVenueFoodOptions();

        for (var i = 0; i < this.hotels.length; i++) {
            var proposal = { hotel: this.hotels[i], venue: this.venues[i], price: undefined };
            this.proposals.push(proposal);
            this.getVenueFoodOptions(this.venues[i]);
            this.getPriceQuote(this.hotels[i], this.venues[i], proposal);
        }        
    }

    getVenueFoodOptions(venue: any) {
        this.appService.Get("/api/Zoho/GetVenueFoodOptions?venueId=" + venue.ID + "&eventDate=" + this.eventForm.value.CheckIn)
            .subscribe((response: any) => {
                if (response != null) {
                    this.foodOptions[venue.ID] = response.data;
                    return response.data;
                }
            },
            (err: HttpErrorResponse) => {
                this.loading = false;
                console.log(err.message);
            }
        );
    }

    onFoodOptionChange(event: any, proposal: any) {
        this.foodChoicePrice = event.target.value;
        this.getPriceQuote(proposal.hotel, proposal.venue, proposal);
    }

    setHover(evt: any, index: number, key_index: number) {
        if (key_index == 0) {
            return;
        }
        if (!evt.relatedTarget) {
            return;
        }
        var plan_column: any = document.getElementsByClassName('plan_column');
        var offset_height = 0;
        for (var i = 0; i < plan_column.length; i++) {
            offset_height = offset_height + plan_column[i].offsetHeight
        }
        this.offsetHeight = offset_height;
        this.priceTable[key_index - 1]['showHover'] = true;
    }

    setHoverOut(evt: any, index: number, key_index: number) {
        if (key_index == 0) {
            return;
        }
        if (!evt.relatedTarget) {
            return;
        }
        this.offsetHeight = 0;
        this.priceTable[key_index - 1]['showHover'] = false;
    }

    onChange(event: any): void {
        if (event.args.changeSource == 'propertyChange' || event.args.changeSource == 'val') { return; }
        // this.myNumberInput.val(event.args.value);
        this.currentValue = event.args.value;
        if (this.currentValue < 2) {
            this.currentValue = 2;
        }
        this.eventForm.controls.chapterContributions.setValue(this.currentValue * 1000);
        console.log(this.currentValue);
        //this.getPriceQuote();
        for (let proposal of this.proposals) {            
            this.getPriceQuote(proposal.hotel, proposal.venue, proposal);
        }
    }

    onMouseDown(event: any): void {
        event.stopPropagation();
    }

    getPriceQuote(hotel: any, venue: any, proposal: any) {
        console.log(hotel);
        console.log(venue);
        this.loading = true;
        console.log(this.eventForm.value);
        var user = JSON.parse(localStorage.getItem('User'));

        var obj = {
            "HotelID": hotel.ID,
            "VenueID": venue.ID,
            "StartDate": this.eventForm.value.CheckIn,
            "EndDate": this.eventForm.value.CheckOut,
            "TotalAttendee": this.eventForm.value.TotalAttendees,
            "FoodCostPerPerson": this.foodChoicePrice,
            "FBDepositBehaviour": "",
            "TransportationAmount": 0,
            "TransportationBehaviour": "",
            "Discount": 0,
            "GroupSplitBills": false,
            "HookupsApplied": false,
            "AbsorbHookUps": false,
            "FreeRoomUpgrades": 0,
            "FreeFormals": 0,
            "CostFreeUpgrades": 0,
            "CostFreeFormals": 0,
            "CostBarTab": 0,
            "Contributions": this.eventForm.value.chapterContributions ? parseInt(this.eventForm.value.chapterContributions) : (this.currentValue * 1000)
        };

        this.appService.Post("/api/Zoho/GetQuotePrice", obj)
            .subscribe((data: any) => {
                this.loading = false;
                if (data) {                    
                    this.priceTable = data.DisplayPrices;
                    //if (!this.eventForm.value['chapterContributions']) {
                    //    this.eventForm.controls.chapterContributions.setValue('1000');
                    //}
                    //data.TotalContributions = this.eventForm.value.chapterContributions;
                    //this.priceTable[0]['couplePrice'] = parseInt(data.TotalPriceCouple + (data.TotalPriceCouple * 0.05))
                    //this.priceTable[1]['couplePrice'] = parseInt(data.TotalPriceCouple);
                    //this.priceTable[2]['couplePrice'] = Math.round(parseInt(data.TotalPriceCouple) - Math.round((data.TotalContributions / (parseInt(data.TotalAttendee) / 2))));

                    //this.priceTable[0]['defaultcouplePrice'] = parseInt(data.TotalPriceCouple + (data.TotalPriceCouple * 0.05))
                    //this.priceTable[1]['defaultcouplePrice'] = parseInt(data.TotalPriceCouple);
                    //this.priceTable[2]['defaultcouplePrice'] = Math.round(parseInt(data.TotalPriceCouple) - Math.round((data.TotalContributions / (parseInt(data.TotalAttendee) / 2))));

                    //this.eventForm.controls['chapterContributions'].setValue(data.TotalContributions);
                    this.price_quote = data;
                    proposal.price = data;
                    this.price_quote_fetched = true;
                    this.maxValue = data.FinalInvoice / 1000;
                    //this.setPlanTable();
                    var contribution = this.eventForm.value.chapterContributions ? parseInt(this.eventForm.value.chapterContributions) : 0;
                    if (contribution < 3000) {
                        this.selectPlan(3);
                    }
                    else if (contribution < 5000) {
                        this.selectPlan(2);
                    }
                    else if (contribution >= 5000) {
                        this.selectPlan(1);
                    }
                    console.log(this.price_quote);
                    console.log(this.proposals);
                }
                setTimeout(() => {
                    this.loading = false;
                    this.loading = false;
                }, 300);

            },
                (err: HttpErrorResponse) => {
                    this.loading = false;
                    console.log(err.message);
                }
            );
    }

    setPlanTable() {
        this.planTitles = this.priceTable.map((p: any) => p.OptionName);

        var planDetails: any = [];
        var optionDetails = [];
        var headerLabels = [];
        headerLabels.push('Couple Pricing');

        this.priceTable.forEach((plans: any) => {
            headerLabels.push(plans.OptionName);
        });

        this.priceTable.forEach((plans: any) => {
            var options = plans.OptionDetails.map((o: string, index: number) => {
                return `${o}`;
            });
            optionDetails.push(options);
        });
        // console.log(optionDetails)
        optionDetails.unshift('Option Details');
        var depositDueDate = this.priceTable.map((p: any) => p.DepositDueDate);
        depositDueDate.unshift('$3K Security Deposit Due**');
        var vendorContractsLocked = this.priceTable.map((p: any) => p.VendorContractsLocked);
        vendorContractsLocked.unshift('Vendor Contracts Locked');
        var refundableAmount = this.priceTable.map((p: any) => p.DepositAmountRefundedAfterEvent);
        refundableAmount.unshift('Deposit Amount Refundable After Event');
        var couplePrice = this.priceTable.map((p: any) => p.PricePerCouple);
        couplePrice.unshift('Price Per Couple');
        var couplePriceTaxes = this.priceTable.map((p: any) => p.PricePerCoupleTaxes);
        couplePriceTaxes.unshift('Price Per Couple');

        planDetails.push(headerLabels);
        planDetails.push(['1', '2', '3', '4']);
        planDetails.push(optionDetails);
        planDetails.push(depositDueDate);
        planDetails.push(vendorContractsLocked);
        planDetails.push(refundableAmount);
        planDetails.push(couplePrice);
        planDetails.push(couplePriceTaxes);
        this.planDetails = planDetails;
    }

    selectPlan(index: number) {
        var plan = this.priceTable[index - 1];
        this.selectedPrice = index;
        console.log(plan);
    }

    getFormValidationErrors(form: FormGroup) {
        const result = [];
        Object.keys(form.controls).forEach(key => {

            const controlErrors = form.get(key).errors;
            if (controlErrors) {
                Object.keys(controlErrors).forEach(keyError => {
                    result.push({
                        'control': key,
                        'error': keyError,
                        'value': controlErrors[keyError]
                    });
                });
            }
        });

        return result;
    }

    changePrice() {
        this.price_checked = !this.price_checked;        
    }

    changeContribution(evt: any) {
        //this.getPriceQuote();
    }

    /// start building
    async confirmDetail(eventForm: FormGroup) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        
        if (localStorage.getItem('User') != undefined) {
            var user = JSON.parse(localStorage.getItem('User'));
            
            var deal = {
                "TravelDate": this.eventForm.value.CheckIn,
                "OrganizationID": user.Organisation.id,
                "UniversityID": user.University.id,
                "Budget": this.eventForm.value.Price,
                "UserID": user.id,
                "Price": this.eventForm.value.Price
            };            
            this.appService.Post("/api/Zoho/CreateDeal", deal)
                .subscribe((data: any) => {
                    if (data.Status) {
                        this.dealId = data.DealID;
                        this.saveEventDetail(data.DealID, data.Priority, eventForm);
                    }
                    else {
                        this.toastr.error(data.Message, "Error");
                        this.loading = false;
                    }
                },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.toastr.error(err.message, "Error");
                    //this.saveEventDetail(this.dealId, eventForm);
                }
            );            
        }
        else {
            localStorage.setItem("IsConfirmDetailScreen", "1");
            this.router.navigate(['/login']);
        }
    }

    saveEventDetail(dealId: string, priority: number, eventForm: FormGroup) {
        var chapterContribution = 0;
        chapterContribution = eventForm.value.chapterContributions ? parseInt(eventForm.value.chapterContributions) : (this.currentValue * 1000);

        var proposalList = [];

        for (let dealProposal of this.proposals) {
            var hotel_pax = [];
            var price = dealProposal.price.DisplayPrices[this.selectedPrice - 1];
            dealProposal.price.HotelPrice.forEach((h: any) => {
                hotel_pax.push({
                    "Pax": h.Pax,
                    "Rate": h.HotelTotalPrice,
                    "ID": h.HotelID,
                    "Units": h.HotelRooms,
                    "ContactID": h.ContactID ? h.ContactID : '',
                    "CancellationDays": h.CancellationDays
                })
            });
            var proposalTerms = '';
            switch (this.selectedPrice) {
                case 1:
                    if (chapterContribution == 0) {
                        proposalTerms = "Zero Down";
                    }
                    else {
                        proposalTerms = "Zero Down Plus";
                    }
                    break;
                case 2:
                    if (chapterContribution == 0) {
                        proposalTerms = "Money Down";
                    }
                    else {
                        proposalTerms = "Money Down Plus";
                    }
                    break;
                default:
                    proposalTerms = "Money Down";
                    break;
            }
            var proposal = {
                "DestinationID": eventForm.value.DestinationId,
                "Discount": dealProposal.price.Discount,
                "EventStartDate": eventForm.value.CheckIn,
                "EventEndDate": eventForm.value.CheckOut,
                "TotalAttendees": dealProposal.price.TotalAttendee,
                "Name": Date.now().toString(),
                "TransportationBehavior": "R-Refer to Partner",
                "HotelSecurityBehavior": "I-Invoice Chapter",
                "FBDepositBehavior": "E-Escrow",
                "Priority": priority,
                "Contribution": chapterContribution,
                "Venue_Duration": Math.round(Math.abs((new Date(this.eventForm.value.CheckOut)).getTime() - (new Date(this.eventForm.value.CheckIn)).getTime()) / (1000 * 60 * 60 * 24)),
                "Type": "Hotel and Venue",
                "VenueDateTime": eventForm.value.EventDate,
                "DealID": dealId,
                "Deposit_Terms": proposalTerms,
                "Hotel_Price_Per_Couple": price.HotelPriceCouple,
                "Hotel_Price_Per_Couple_Taxes": price.HotelPriceCoupleTaxes,
                "Facility_Price_Per_Couple": price.FacilityPriceCouple,
                "Facility_Price_Per_Couple_Taxes": price.FacilityPriceCoupleTaxes,
                "Food_Price_Per_Couple": price.FoodPriceCouple,
                "Food_Price_Per_Couple_Taxes": price.FoodPriceCoupleTaxes,
                "Total_Price_Per_Couple": price.TotalPriceCouple,
                "Total_Price_Per_Couple_Taxes": price.TotalPriceCoupleTaxes,
                "Hotels": hotel_pax,
                "Venue": {
                    "Pax": dealProposal.price.FacilityPrice.Pax,
                    "Rate": dealProposal.price.VenuePrice.VenuePricePerson,
                    "ID": dealProposal.price.VenuePrice.VenueID,
                    "Units": 1,
                    "ContactID": dealProposal.price.FacilityPrice.ContactID ? dealProposal.price.FacilityPrice.ContactID : '',
                    "CancellationDays": dealProposal.price.FacilityPrice.CancellationDays
                },
                "ProposalID": ''
            };

            proposalList.push(proposal);            
        }

        this.appService.Post("/api/Zoho/CreateProposal", proposalList)
            .subscribe(data => {
                setTimeout(() => {
                    this.loading = false;
                }, 300);
                var response = data as any;
                if (response) {
                    if (response.Status) {                        
                        localStorage.setItem("DealID", dealId);
                        localStorage.removeItem("BuildAnotherDealID");
                        if (!this.globalService.IsAdmin) {
                            this.globalService.SetIsAdminAccount(true);
                        }
                        setTimeout(() => {
                            this.router.navigate(['/proposal-cart']);
                        }, 500);
                    }
                    else {
                        this.toastr.error(response.Message, "Error");
                        this.loading = false;
                    }                    
                }
                else {
                    this.toastr.error("An error has occured.", "Error");
                    this.Error = "An error has occurred";
                }
            },
            (err: HttpErrorResponse) => {
                this.loading = false;
                console.log(err.message);
            }
        );
    }

    /// Function for show rating star
    counter(i: number) {
        return new Array(i);
    }

    /// show selected name in autocomplete
    displayFn(selected: any) {
        if (selected) { return selected.name; }
    }

    venueDetail(eventForm: FormGroup, venue: any) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        localStorage.setItem("ConfirmDetailVenueID", venue.ID.toString())
        this.router.navigate(['/venue-detail']);
    }

    hotelDetail(eventForm: FormGroup, hotel: any) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        localStorage.setItem("ConfirmDetailHotelID", hotel.ID.toString())
        this.router.navigate(['/hotel-detail']);
    }

    changeHotel(eventForm: FormGroup) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        this.router.navigate(['/hotels']);
    }

    changeVenue(eventForm: FormGroup) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        this.router.navigate(['/venues']);
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

    changeOption(foodChoice: any) {
        var foodChoiceAmount = parseFloat(foodChoice);
        if (isNaN(foodChoiceAmount)) {
            foodChoiceAmount = 0;
        }
        this.foodChoicePrice = foodChoiceAmount;
        //this.getPriceQuote();
    }

    changeChapterContribution(chapterContributions: any) {
        this.chapterContribution = parseInt(chapterContributions);        
    }
}