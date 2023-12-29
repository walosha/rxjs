import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

import { HotelInterface } from '../hotels/hotel.class';
import { VenueInterface } from '../venues/venue.class';

import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';

//const Swal = require('sweetalert2');

@Component({
    selector: 'app-proposal-cart',
    templateUrl: './proposal-cart.component.html',
    styleUrls: ['./proposal-cart.component.css']
})
export class ProposalCartComponent implements OnInit {
    venue: VenueInterface;
    hotel: HotelInterface;
    proposalForm: FormGroup;
    filteredSeasons: any;
    filteredYears: any;    
    EventDate: any;
    Price: any;
    FoodChoice: number = 0;
    foodChoicePrice: number;
    chapterContribution: number;
    Error: string;
    selectedPrice: number = 2;
 
    templateList: Array<object> = [];

    proposalModel: object = null;
    AdminEventData: object = null;
    agreement_accepted: boolean = false;
    is_hotel_deleted: boolean = false;

    Hotel_List: any[] = [];

    addOnBlur = false;
    readonly separatorKeysCodes = [ENTER, COMMA] as any;
    email_others: any[] = [];
    text_others: any[] = [];
    price_checked: boolean = false;
    loading: boolean = false;
    season_list: Array<object> = [];
    dealId: any;
    isApproved: boolean = false;

    constructor(private fb: FormBuilder, protected router: Router, public route: ActivatedRoute, private httpClient: HttpClient, private appService: AppService, protected globalService: GlobalService) {
        this.foodChoicePrice = 0;
    }

    ngOnInit() {
        if (this.globalService.UserID == '' && this.globalService.UserID == undefined) {
            this.router.navigate(['/login']);
        }
        // Event form group
        this.proposalForm = this.fb.group({
            Season: ['', Validators.required],
            Year: ['', Validators.required]            
        });        

        if (this.globalService.GetIsAdminAccount() != "true") {
            this.router.navigate(['/myevent']);
        }
        
        
        this.filteredSeasons = this.proposalForm.get('Season').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchSeason({ name: value }, 1)));

        this.filteredYears = this.proposalForm.get('Year').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchYear({ name: value }, 1)));

        this.filteredYears = this.appService.searchYear({ name: "" }, 1);

        var proposalModel = localStorage.getItem('proposalModel');
        if(proposalModel){
            proposalModel = JSON.parse(proposalModel);
            this.proposalModel = proposalModel as any;
        }
        var user = JSON.parse(localStorage.getItem('User'));
        if (localStorage.getItem('DealID') != undefined) {
            this.dealId = localStorage.getItem('DealID');
            this.GetAdminEvent(user.id, this.dealId);
            this.GetProposalCart(this.dealId);
        }

        this.proposalForm.controls['Season'].valueChanges.subscribe((res: any) => {
            if (res) {
                this.GetProposalCart(res);
                this.dealId = res;
            }
        });
    }

    GetProposalCart(id) {
        this.loading = true;
        this.appService.Get("API/Zoho/GetProposalCart?dealId=" + id)
            .subscribe(data => {
                if(data){
                    var response = data as any[];
                    response.forEach((r: any, index: number) => {
                        r.Index = index + 1;
                        r.show = true;

                        if (r.DealSubmitted) {
                            this.isApproved = true;
                        }
                    })

                    this.Hotel_List = response;                
                }
                setTimeout(() => {
                    this.loading = false;
                }, 500);
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                setTimeout(() => {
                    this.loading = false;
                }, 500);
            }
        );
    }

    GetAdminEvent(id, ProposalCartID) {
        this.loading = true;        
        this.appService.Post("API/Zoho/GetAdminEvent", { Id: id })
            .subscribe(data => {
                var response = data as any[];
                response.forEach((r: any) => {
                    r.id = r.ProposalCartID;
                    r.text = r.Season + " " + r.Year;
                })
                this.season_list = response;
                this.proposalForm.controls.Season.setValue(ProposalCartID);
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
            }
        );
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
    
        if (value) {
          this.email_others.push({name: value});
        }
        event.input.value = '';
        // Clear the input value
        // event.chipInput!.clear();
        event.value = '';
    }
    
    remove(fruit: any): void {
        const index = this.email_others.indexOf(fruit);
    
        if (index >= 0) {
          this.email_others.splice(index, 1);
        }
    }

    text_others_add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (value) {
          this.text_others.push({name: value});
        }
        event.input.value = '';
        event.value = '';
    }
    
    text_others_remove(fruit: any): void {
        const index = this.text_others.indexOf(fruit);
        if (index >= 0) {
          this.text_others.splice(index, 1);
        }
    }

    changePrice(){
        this.price_checked = !this.price_checked;        
    }

    /// start building
    confirmDetail(eventForm: FormGroup) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        if (localStorage.getItem('UserName') != undefined) {
            var user = JSON.parse(localStorage.getItem('User'));
            var hotel = JSON.parse(localStorage.getItem('Hotel'));
            var venue = JSON.parse(localStorage.getItem('Venue'));
            var proposalModel = {
                AccountNumber: user.Account_Name.id,
                ContactNumber: user.id,
                Price: this.Price,
                TotalAttendees: eventForm.value.TotalAttendees,
                Mobile: user.Mobile,
                ProposalName: eventForm.value.eventName,
                Location: eventForm.value.Destination,
                OrgContribution: eventForm.value.chapterContributions,
                DownPayment: 2500,
                CheckIn: eventForm.value.CheckIn,
                CheckOut: eventForm.value.CheckOut,
                OrganizationId: eventForm.value.organization,
                UniversityId: eventForm.value.university,
                Items: [{
                    ID: hotel.ID + "~" + hotel.ProductID,
                    Description: hotel.HotelName,
                    ItemType: 'Hotel',
                    Price: hotel.Price,
                    Cost: hotel.Price
                },
                {
                    ID: venue.ID + "~" + venue.ProductID,
                    Description: venue.VenueName,
                    ItemType: 'Venue',
                    Price: venue.Price,
                    Cost: venue.Price
                },
                {
                    ID: eventForm.value.FoodChoice,
                    ItemType: 'Food',
                    Price: this.foodChoicePrice,
                    Cost: this.foodChoicePrice
                }]
            };
            this.appService.Post("API/Zoho/SaveProposal", proposalModel)
                .subscribe(data => {
                    var response = data as any;
                    debugger;
                    if (response.Status) {
                        this.router.navigate(['/adminevent']);
                    }
                    else {
                        this.Error = "An error has occurred";
                    }
                },
                    (err: HttpErrorResponse) => {
                        console.log(err.message);
                    }
                );
        }
        else {
            localStorage.setItem("IsConfirmDetailScreen", "1");
            this.router.navigate(['/login']);
        }
    }

    buildAnother() {
        localStorage.setItem("BuildAnotherDealID", this.dealId);
        localStorage.removeItem("StartBuilding");
        this.router.navigate(['/']);
    }

    startPlanning() {
        localStorage.setItem("StartPlanningDealID", this.dealId);        
        this.router.navigate(['/proposal-contract']);
        //this.loading = true;
        //this.appService.Post("API/Zoho/SubmitDeal", { Id: this.dealId })
        //    .subscribe(data => {
        //        this.loading = false;
        //        localStorage.removeItem("StartPlanningDealID");
        //        this.router.navigate(['/adminevent']);
        //    },
        //    (err: HttpErrorResponse) => {
        //        console.log(err.message);
        //        this.loading = false;
        //    }
        //);
    }

    /// Function for show rating star
    counter(i: number) {
        return new Array(i);
    }

    /// show selected name in autocomplete
    displayFn(selected: any) {
        if (selected) { return selected.name; }
    }


    changeHotel(eventForm: FormGroup) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        this.router.navigate(['/hotels']);
    }

    changeVenue(eventForm: FormGroup) {
        localStorage.setItem("ConfirmDetail", JSON.stringify(eventForm.value));
        this.router.navigate(['/venues']);
    }

    changeOption(foodChoice: any) {
        var foodChoiceAmount = parseFloat(foodChoice);
        if (isNaN(foodChoiceAmount)) {
            foodChoiceAmount = 0;
        }
        this.foodChoicePrice = foodChoiceAmount;
    }

    changeChapterContribution(chapterContributions: any) {
        this.chapterContribution = parseInt(chapterContributions);
    }

    ChangeStatus(proposal: any, index: number) {
        if (confirm('Are you sure want to delete?')) {
            this.Hotel_List.splice(index, 1);

            this.loading = true;
            this.appService.Post("API/Zoho/RemoveProposalByID", { Id: proposal.EventID })
                .subscribe(data => {
                    this.loading = false;
                },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
        }
    }

    scrollUp(index: number) {
        for (var i = 0; i < this.Hotel_List.length; i++) {
            if (i == index) {
                var newIndex = i - 1;
                if (newIndex >= this.Hotel_List.length || newIndex < 0) return;
                var temp = this.Hotel_List[i];
                this.Hotel_List[i] = this.Hotel_List[newIndex];
                this.Hotel_List[newIndex] = temp;
            }
        }
        //document.querySelector('#hotel_' + (index - 1)).scrollIntoView({ behavior: 'smooth' });
        var data = [];
        for (var i = 0; i < this.Hotel_List.length; i++) {
            data.push({ ID: this.Hotel_List[i].EventID, Priority: (i + 1)});
        }
        this.updatePriority(data);

    }

    updatePriority(obj) {
        this.loading = true;
        this.appService.Post("API/Zoho/UpdateProposalPriority", obj)
            .subscribe(data => {
                this.loading = false;                
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }

    scrollDown(index: number) {
        for (var i = 0; i < this.Hotel_List.length; i++) {
            if (i == index) {
                var newIndex = i + 1;
                if (newIndex >= this.Hotel_List.length || newIndex < 0) return;
                var temp = this.Hotel_List[i];
                this.Hotel_List[i] = this.Hotel_List[newIndex];
                this.Hotel_List[newIndex] = temp;
            }
        }
        //document.querySelector('#hotel_' + (index + 1)).scrollIntoView({ behavior: 'smooth' });

        var data = [];
        for (var i = 0; i < this.Hotel_List.length; i++) {
            data.push({ ID: this.Hotel_List[i].EventID, Priority: (i + 1) });
        }
        this.updatePriority(data);
    }

    

    ViewEvent(hotel: any) {
        localStorage.setItem("ProposalID", hotel.EventID);
        localStorage.setItem('hotel_event_detail', JSON.stringify(hotel));
        this.router.navigate(['/events']);
    }

    //scrollUp(hotel: any){
    //    document.querySelector('#hotel_' + (hotel.Index)).scrollIntoView({behavior: 'smooth'});
    //}

    //scrollDown(hotel: any){
    //    document.querySelector('#hotel_' + (hotel.Index)).scrollIntoView({behavior: 'smooth'});
    //}

    save(){
        console.log(this.proposalForm.value)
    }
}
