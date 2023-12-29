import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ModalDirective } from 'angular-bootstrap-md';
import { PlotBand } from '@progress/kendo-angular-charts';

import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { } from 'googlemaps';

import { AppService } from '../services/app.service';
import { HotelInterface } from '../hotels/hotel.class';
import { VenueInterface } from '../venues/venue.class';

import { GlobalService } from '../services/global.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from './../../environments/environment';

import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexAnnotations,
    ApexFill,
    ApexStroke,
    ApexGrid,
    ApexMarkers,
    ApexStates,
    ApexTooltip,
    ApexXAxis,
    ApexResponsive,
    ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
    series: any;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    responsive: ApexResponsive[];
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    legend: ApexLegend;
    fill: ApexFill;
    grid: ApexGrid;
    toolTip: ApexTooltip;
    colors: string[];
};

export type MobileChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: any; //ApexXAxis;
    annotations: ApexAnnotations;
    fill: ApexFill;
    stroke: ApexStroke;
    grid: ApexGrid;
    markers: ApexMarkers;
    colors: string[];
    states: ApexStates;
    tooltip: ApexTooltip;
};

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css']
})

export class EventsComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('cardInfo') cardInfo: ElementRef;
    card: any;
    cardHandler: any;
    cardError: string;

    @ViewChild('mobileCardInfo') mobileCardInfo: ElementRef;
    mobileCard: any;
    mobileCardHandler: any;
    mobileCardError: string;

    stripe = Stripe(environment.stripe_Public_Key);
    elements = this.stripe.elements();
    cardCreated: boolean = false;

    mobileStripe = Stripe(environment.stripe_Public_Key);
    mobileElements = this.mobileStripe.elements();
    MobileCardCreated: boolean = false;

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
    showPayment: boolean = false;
    showMobilePayment: boolean = false;
    loading: boolean = false;
    amount: number = 0;
    couples: number = 0;
    description: string = "";
    IsDeposit: boolean = false;
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

    private gVenueMapElement: ElementRef;
    @ViewChild('gVenueMap') set VenueContent(content: ElementRef) {
        this.gVenueMapElement = content;
        this.loadHotelAndVenueMap();
    }
    VenueMap: google.maps.Map;

    private gHotelMapElement: ElementRef;
    @ViewChild('gHotelMap') set HotelContent(content: ElementRef) {
        this.gHotelMapElement = content;
        this.loadHotelAndVenueMap();
    }
    hotelMap: google.maps.Map;

    hotel_event_detail: any;

    attendees_list: Array<object> = [];

    visible = true;
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    attendeeCtrl = new FormControl();
    filteredAttendee: Observable<string[]>;
    attendees: string[] = [];
    allAttendees: string[] = [];
    ShowRoomOption: boolean = false;

    adminCtrl = new FormControl();
    filteredAdmin: Observable<string[]>;
    admins: string[] = [];
    allAdmins: string[] = [];

    @ViewChild('attendeeInput') attendeeInput: ElementRef<HTMLInputElement>;

    @ViewChild('adminInput') adminInput: ElementRef<HTMLInputElement>;

    hotelDetail: HotelInterface;
    hotelDetails: any;
    Arr = Array;
    venueDetail: VenueInterface;
    roomMates: any;

    IsAdmin: boolean = false;

    @ViewChild("chart") chart: ChartComponent;
    public chartOptions: Partial<MobileChartOptions>;

    @ViewChild("mobile_chart") mobile_chart: ChartComponent;
    public mobile_chartOptions: Partial<MobileChartOptions>;

    hideInterest: boolean = true;
    hidePayment: boolean = true;
    paidAmount: number = 0;
    paidDepositAmount: number = 0;
    maxAmount: number = 0;
    creditCardCharges: number = 0;
    bookingFeeAmount: number = 0;

    attendee_status: Object = {
        Paying: 0,
        Paid: 0,
        Interested: 0,
        Invited: 0,
        Declined: 0
    }

    selectedRoom: any;
    RoomNumber: any;
    RoomMateName: any;

    payment_history: any[] = [];
    deposit_payment_history: any[] = [];
    show_action_btn: boolean = false;
    view_payment_history: boolean = false;
    view_deposit_payment_history: boolean = false;

    panelOpenState = false;

    user_images_list: string[] = [
        '../../assets/images/Ellipse 27.png',
        '../../assets/images/Ellipse 32.png',
        '../../assets/images/Ellipse 33.png',
        '../../assets/images/Ellipse 34.png',
        '../../assets/images/Ellipse 35.png'
    ]

    constructor(private appService: AppService, private router: Router, protected globalService: GlobalService, private toastr: ToastrService, private cd: ChangeDetectorRef) {
        var depositeDueDate = new Date();
        this.DepositeDueDate = new Date(depositeDueDate.setDate(depositeDueDate.getDate() + 10));
        this.InviteDueDate = new Date(depositeDueDate.setDate(depositeDueDate.getDate() + 20));
        //this.eventDetail = {};

        this.filteredAttendee = this.attendeeCtrl.valueChanges.pipe(startWith(null), map((x: string | null) => x ? this._filter(x) : this.allAttendees.slice()));
        this.filteredAdmin = this.adminCtrl.valueChanges.pipe(startWith(null), map((x: string | null) => x ? this._filterAdmin(x) : this.allAdmins.slice()));
    }

    createGraph1() {
        var paid_amount = this.eventDetail.PaidAmount;
        var min_amount = this.eventDetail.MinimumAmount;
        var total_amount = this.eventDetail.TotalAmount;
        var data = [paid_amount, min_amount, total_amount];
        this.mobile_chartOptions = {
            series: [
                {
                    data: data
                }
            ],
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            annotations: {
                position: 'front',
                points: [
                    {
                        x: 'Paid',
                        y: 1302,
                        yAxisIndex: 0,
                        seriesIndex: 0,
                        label: {
                            borderColor: "#FE6700",
                            offsetY: -10,
                            style: {
                                color: "#FE6700",
                                background: "#FFF9F5",
                                padding: {
                                    left: 10,
                                    right: 10,
                                    top: 5,
                                    bottom: 5,
                                },
                                fontSize: '12px'
                            },
                            text: '$' + data[0].toString(),

                        },
                        marker: {
                            size: 12,
                            fillColor: "#fff",
                            strokeColor: "rgba(254, 103, 0, 1)",
                            strokeWidth: 3,
                            shape: "circle",
                        },
                    },
                    {
                        x: 'Minimum',
                        y: 4000,
                        yAxisIndex: 0,
                        seriesIndex: 0,
                        label: {
                            borderColor: "#D9D9D9",
                            offsetY: -10,
                            style: {
                                color: "#666666",
                                background: "#D9D9D9",
                                padding: {
                                    left: 10,
                                    right: 10,
                                    top: 5,
                                    bottom: 5,
                                },
                                fontSize: '12px'
                            },
                            text: '$' + data[1].toString()
                        },
                        marker: {
                            size: 12,
                            fillColor: "#fff",
                            strokeColor: "rgba(209, 209, 209, 1)",
                            strokeWidth: 3,
                            shape: "circle",
                        }
                    },
                    {
                        x: "Total",
                        y: 12650,
                        yAxisIndex: 0,
                        seriesIndex: 0,
                        label: {
                            borderColor: "#D9D9D9",
                            offsetY: -10,
                            style: {
                                color: "#666666",
                                background: "#D9D9D9",
                                padding: {
                                    left: 10,
                                    right: 10,
                                    top: 5,
                                    bottom: 5,
                                },
                                fontSize: '12px'
                            },
                            text: '$' + data[2].toString()
                        },
                        marker: {
                            size: 12,
                            fillColor: "#fff",
                            strokeColor: "rgba(209, 209, 209, 0.5)",
                            strokeWidth: 3,
                            shape: "circle",
                        }
                    }
                ]
            },
            chart: {
                height: 350,
                type: "bar",
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: 0
            },

            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            xaxis: {
                labels: {
                    rotate: -45
                },
                categories: [
                    "Paid",
                    "Minimum",
                    "Total"
                ],
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                title: {
                    text: ""
                }
            },
            fill: {
                colors: [function (value: any) {
                    if (value.dataPointIndex == 0) {
                        return 'rgba(254, 103, 0, 1)';
                    }
                    else if (value.dataPointIndex == 1) {
                        return 'rgba(237, 235, 234, 1)';
                    }
                    else {
                        return 'rgba(209, 209, 209, 1)';
                    }
                }]
            },
            tooltip: {
                enabled: false
            }
        };
    }

    ngOnInit() {
        if (this.globalService.UserID != '' && this.globalService.UserID != undefined) {
            this.intializeData();
        }
        else {
            this.router.navigate(['/login']);
        }
    }

    ngOnDestroy() {
        if (this.card) {
            // We remove event listener here to keep memory clean
            this.card.removeEventListener('change', this.cardHandler);
            this.card.destroy();
        }
    }

    ngAfterViewInit() {
        //this.initiateCardElement();
    }

    initiateCardElement() {
        // Giving a base style here, but most of the style is in scss file
        var cardStyle = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        };
        if (this.card == undefined) {
            this.card = this.elements.create('card');
        }
        this.card.mount(this.cardInfo.nativeElement);
        this.card.addEventListener('change', this.cardHandler);
    }

    initiateMobileCardElement() {
        // Giving a base style here, but most of the style is in scss file
        var cardStyle = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        };
        if (this.mobileCard == undefined) {
            this.mobileCard = this.mobileElements.create('card');
        }
        this.mobileCard.mount(this.mobileCardInfo.nativeElement);
        this.mobileCard.addEventListener('change', this.mobileCardHandler);
    }

    onChange({ error }) {
        if (error) {
            this.cardError = error.message;
        } else {
            this.cardError = null;
        }
        this.cd.detectChanges();
    }

    async createStripeToken() {
        const { token, error } = await this.stripe.createToken(this.card);
        if (token) {
            this.onSuccess(token);
        } else {
            this.onError(error);
        }
    }

    async createMobileStripeToken() {
        const { token, error } = await this.mobileStripe.createToken(this.mobileCard);
        if (token) {
            this.onSuccess(token);
        } else {
            this.onError(error);
        }
    }

    onSuccess(token) {
        console.log(token);
        this.loading = true;
        
        var description = "";
        if (this.IsAdmin || true) {
            description = this.description;
        }
        else {
            description = "Paid $" + this.amount + " for " + this.couples + " couples.";
        }

        var pay = {
            "ProposalID": this.eventDetail.ProposalID,
            "DealID": this.eventDetail.DealID,
            "ContactID": this.globalService.UserID,
            "TransactionID": this.makeid(10).toUpperCase(),
            "TokenID": token.id,
            "TransactionStatus": "Success",
            "TransactionMessage": description,
            "Amount": this.amount,
            "IsDeposit": this.IsDeposit,
            "BookingAmount": this.bookingFeeAmount,
            "CreditCardCharges": this.creditCardCharges
        };

        this.appService.Post("/api/Zoho/SaveProposalTransaction", pay)
            .subscribe(data => {
                this.loading = false;
                this.toastr.success("Payment transaction saved successfully.", "Success");
                this.amount = 0;
                this.description = '';
                this.couples = 1;
                this.showPayment = false;
                this.showMobilePayment = false;
                this.FetchInvitees(this.eventDetail.DealID);
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.toastr.error(err.message, "Error");
                    this.loading = false;
                }
            );

        //this.dialogRef.close({ token });
    }

    onError(error) {
        this.loading = false;
        if (error.message) {
            this.cardError = error.message;
            this.mobileCardError = error.message;
        }
    }

    counter(i: number) {
        return new Array(i);
    }

    intializeData() {
        this.view_payment_history = false;

        if (localStorage.getItem('ProposalID') != undefined) {
            this.GetEventDetail(localStorage.getItem('ProposalID'));
        }
        else {
            if (this.globalService.GetIsAdminAccount() == "true") {
                this.router.navigate(['/adminevent']);
            }
            else {
                this.router.navigate(['/myevent']);
            }
        }        
    }

    ViewPayment() {
        var ProposalID = localStorage.getItem('ProposalID');
        this.view_payment_history = !this.view_payment_history;
        this.fetchTransactionHistory(ProposalID);
    }

    ViewDepositPayment() {
        var ProposalID = localStorage.getItem('ProposalID');
        this.view_deposit_payment_history = !this.view_deposit_payment_history;
        this.fetchTransactionHistory(ProposalID);
    }

    ViewMobilePayment() {
        this.showMobilePayment = false;
        var ProposalID = localStorage.getItem('ProposalID');
        this.view_payment_history = !this.view_payment_history;
        this.fetchTransactionHistory(ProposalID);
    }

    fetchTransactionHistory(ProposalID: string) {
        this.loading = true;
        this.appService.Get("/api/Zoho/GetProposalTransation?proposalId=" + this.eventDetail.DealID)
            .subscribe((data: any) => {
                if (data) {
                    this.payment_history = data;                    
                    if (!this.IsAdmin) {
                        this.payment_history = this.payment_history.filter(x => x.ContactID == this.globalService.UserID && !x.IsDeposit);
                        this.paidAmount = 0;
                        this.payment_history.forEach((a: any) => {
                            if (a.ContactID == this.globalService.UserID && a.Status == "succeeded") {
                                this.paidAmount += (a.Amount);
                            }
                        });                        
                    }
                    else {
                        this.deposit_payment_history = this.payment_history.filter(x => x.IsDeposit);
                        this.paidDepositAmount = 0;
                        this.deposit_payment_history.forEach((a: any) => {
                            if (a.Status == "succeeded") {
                                this.paidDepositAmount += (a.Amount);
                            }
                        });                        
                    }
 
                    if (this.paidAmount >= this.eventDetail.PricePerCouple || this.paidDepositAmount >= this.eventDetail.AdminContribution) {
                        this.hidePayment = true;
                    }

                    this.loading = false;
                    console.log(data);
                }
            },
                (err: HttpErrorResponse) => {
                    this.loading = false;
                }
            );
    }

    showInterest(status: string) {        
        var post = {
            "DealID": this.eventDetail.DealID,
            "ContactID": this.globalService.UserID,
            "Status": status
        }
        this.loading = true;
        this.appService.Post("/api/Zoho/DealInviteByID", post)
            .subscribe((data: any) => {
                this.FetchInvitees(this.eventDetail.DealID);
                setTimeout(() => {
                    this.loading = false;
                }, 2000);
            },
                (err: HttpErrorResponse) => {
                    this.loading = false;
                }
            );
    }

    createGraph() {
        var paid_amount = this.eventDetail.PaidAmount;
        var min_amount = this.eventDetail.MinimumAmount;
        var min_percentage = ((paid_amount * 100) / min_amount).toFixed(2);
        if (parseInt(min_percentage) > 100) {
            min_percentage = '100';
        }
        var total_amount = this.eventDetail.TotalAmount;
        var total_percentage = ((paid_amount * 100) / total_amount).toFixed(2);
        if (parseInt(total_percentage) > 100) {
            total_percentage = '100';
        }
        var data = [min_amount, total_amount];
        this.chartOptions = {
            series: [
                {
                    data: data
                }
            ],
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            annotations: {
                position: 'front',
                points: [
                    //{
                    //    x: 'Paid',
                    //    y: 1302,
                    //    yAxisIndex: 0,
                    //    seriesIndex: 0,
                    //    label: {
                    //        borderColor: "#FE6700",
                    //        offsetY: -10,
                    //        style: {
                    //            color: "#FE6700",
                    //            background: "#FFF9F5",
                    //            padding: {
                    //                left: 10,
                    //                right: 10,
                    //                top: 5,
                    //                bottom: 5,
                    //            },
                    //            fontSize: '12px'
                    //        },
                    //        text: '$' + data[0].toString(),

                    //    },
                    //    marker: {
                    //        size: 12,
                    //        fillColor: "#fff",
                    //        strokeColor: "rgba(254, 103, 0, 1)",
                    //        strokeWidth: 3,
                    //        shape: "circle",
                    //    },
                    //},
                    {
                        x: "Goal 50% - " + this.eventDetail.GoalAMinimumDate,
                        y: 4000,
                        yAxisIndex: 0,
                        seriesIndex: 0,
                        label: {
                            borderColor: "#D9D9D9",
                            offsetY: -10,
                            style: {
                                color: "#666666",
                                background: "#D9D9D9",
                                padding: {
                                    left: 10,
                                    right: 10,
                                    top: 5,
                                    bottom: 5,
                                },
                                fontSize: '12px'
                            },
                            text: min_percentage + "%"
                        },
                        marker: {
                            size: 12,
                            fillColor: "#fff",
                            strokeColor: "rgba(209, 209, 209, 1)",
                            strokeWidth: 3,
                            shape: "circle",
                        }
                    },
                    {
                        x: "Goal 100% - " + this.eventDetail.GoalBMinimumDate,
                        y: 12650,
                        yAxisIndex: 0,
                        seriesIndex: 0,
                        label: {
                            borderColor: "#D9D9D9",
                            offsetY: -10,
                            style: {
                                color: "#666666",
                                background: "#D9D9D9",
                                padding: {
                                    left: 10,
                                    right: 10,
                                    top: 5,
                                    bottom: 5,
                                },
                                fontSize: '12px'
                            },
                            text: total_percentage + "%"
                        },
                        marker: {
                            size: 12,
                            fillColor: "#fff",
                            strokeColor: "rgba(209, 209, 209, 0.5)",
                            strokeWidth: 3,
                            shape: "circle",
                        }
                    }
                ]
            },
            chart: {
                height: 350,
                type: "bar",
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: 0
            },

            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            xaxis: {
                labels: {
                    rotate: -45
                },
                categories: [                    
                    "Goal 50% - " + this.eventDetail.GoalAMinimumDate,
                    "Goal 100% - " + this.eventDetail.GoalBMinimumDate
                ],
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                title: {
                    text: ""
                }
            },
            fill: {
                colors: [function (value: any) {
                    /*if (value.dataPointIndex == 0) {
                        return 'rgba(254, 103, 0, 1)';
                    }
                    else*/ if (value.dataPointIndex == 0) {
                        if (paid_amount < min_amount) {
                            return 'rgba(237, 235, 234, 1)';
                        }
                        else {
                            return 'rgba(254, 103, 0, 1)';
                        }
                    }
                    else {
                        if (paid_amount < min_amount) {
                            return 'rgba(209, 209, 209, 1)';
                        }
                        else {
                            return 'rgba(254, 103, 0, 1)';
                        }
                    }
                }]
            },
            tooltip: {
                enabled: false
            }
        };
    }

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

    FetchInvitees(DealID: string) {
        this.appService.Get("api/Zoho/GetInvitesByDealID?dealId=" + DealID)
            .subscribe(data => {
                if (data) {
                    var response = data as any[];
                    this.attendees_list = response;
                }
                this.ShowRoomOption = false;                
                this.attendees_list.forEach((a: any) => {
                    if (a.ContactID == this.globalService.UserID && a.Role == "Admin") {
                        this.IsAdmin = true;
                    }
                    if (a.ContactID == this.globalService.UserID && a.Status == "Invited") {
                        this.hidePayment = true;
                        this.hideInterest = false;
                    }
                    else if (a.ContactID == this.globalService.UserID && (a.Status == "Interested" || a.Status == "Paying")) {
                        this.hideInterest = true;
                        this.hidePayment = false;
                    }
                    else if (a.ContactID == this.globalService.UserID && (a.Status == "Paid in Full" || a.Status == "Declined")) {
                        this.hidePayment = true;
                        this.hideInterest = true;
                    }
                    if (a.ContactID == this.globalService.UserID && a.Status != "Declined") {
                        if (a.RoomNumber == null || a.RoomNumber == undefined) {
                            this.ShowRoomOption = true;
                        }
                        else {
                            this.RoomNumber = a.RoomNumber;
                        }
                    }
                });
                if (this.ShowRoomOption || this.RoomNumber != undefined) {
                    if (this.ShowRoomOption) {
                        this.FetchRoomMates(this.eventDetail.DealID, this.eventDetail.ProposalID);
                    }
                    else {
                        this.attendees_list.forEach((a: any) => {
                            if (a.ContactID != this.globalService.UserID && a.RoomNumber == this.RoomNumber) {
                                this.RoomMateName = a.ContactName;
                            }
                        });
                    }
                }

                this.attendee_status['Paying'] = this.attendees_list.filter((f: any) => f.Status == 'Paying').length;
                this.attendee_status['Paid'] = this.attendees_list.filter((f: any) => f.Status == 'Paid in Full').length;
                this.attendee_status['Interested'] = this.attendees_list.filter((f: any) => f.Status == 'Interested').length;
                this.attendee_status['Invited'] = this.attendees_list.filter((f: any) => f.Status == 'Invited').length;
                this.attendee_status['Declined'] = this.attendees_list.filter((f: any) => f.Status == 'Declined').length;
            },
                (err: HttpErrorResponse) => {
                    console.log(err);
                }
            );
    }

    FetchRoomMates(DealID: string, ProposalID: string) {
        this.appService.Get("api/Zoho/GetRoomMates?dealId=" + DealID + "&proposalId=" + ProposalID)
            .subscribe(data => {
                if (data) {
                    var response = data as any;
                    this.roomMates = response;
                }
            },
                (err: HttpErrorResponse) => {
                    console.log(err);
                }
            );
    }

    isEmail(search: string): boolean {
        var serchfind: boolean;
        var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        serchfind = regexp.test(search);
        console.log(serchfind)
        return serchfind;
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our attendee
        if (this.isEmail(value)) {
            if ((value || '').trim()) {
                this.attendees.push(value.trim());
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.attendeeCtrl.setValue(null);
        }
    }

    remove(value: string): void {
        const index = this.attendees.indexOf(value);

        if (index >= 0) {
            this.attendees.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.attendees.push(event.option.viewValue);
        this.attendeeInput.nativeElement.value = '';
        this.attendeeCtrl.setValue(null);
    }

    addAdmin(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (this.isEmail(value)) {
            // Add our admin
            if ((value || '').trim()) {
                this.admins.push(value.trim());
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.adminCtrl.setValue(null);
        }
    }

    removeAdmin(value: string): void {
        const index = this.admins.indexOf(value);

        if (index >= 0) {
            this.admins.splice(index, 1);
        }
    }

    selectedAdmin(event: MatAutocompleteSelectedEvent): void {
        this.admins.push(event.option.viewValue);
        this.adminInput.nativeElement.value = '';
        this.adminCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allAttendees.filter(x => x.toLowerCase().indexOf(filterValue) === 0);
    }

    private _filterAdmin(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allAdmins.filter(x => x.toLowerCase().indexOf(filterValue) === 0);
    }

    GetEventDetail(id) {
        this.loading = true;
        this.appService.Post("API/Zoho/GetEventDetail", { Id: id })
            .subscribe(data => {
                this.loading = false;
                var response = data as any;
                this.eventDetail = response;
                console.log(response);
                this.FetchInvitees(this.eventDetail.DealID);
                this.fetchTransactionHistory(this.eventDetail.DealID);
                this.createGraph();
                this.createGraph1();
                this.show_action_btn = true;
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
    }

    loadHotelAndVenueMap() {
        if (this.gHotelMapElement != undefined) {
            var mapProp = {
                center: new google.maps.LatLng(this.eventDetail.Hotel.Latitude, this.eventDetail.Hotel.Longitude),
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.hotelMap = new google.maps.Map(this.gHotelMapElement.nativeElement, mapProp);

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(this.eventDetail.Hotel.Latitude, this.eventDetail.Hotel.Longitude),
                map: this.hotelMap,
                title: this.eventDetail.Hotel.HotelName,
                icon: ' ',
                label: {
                    fontFamily: 'Fontawesome',
                    text: '\uf041',
                    fontSize: '32px',
                    color: '#FB6100'
                }
            });
        }

        if (this.gVenueMapElement != undefined) {
            var mapProp = {
                center: new google.maps.LatLng(this.eventDetail.Venue.Latitude, this.eventDetail.Venue.Longitude),
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.VenueMap = new google.maps.Map(this.gVenueMapElement.nativeElement, mapProp);

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(this.eventDetail.Venue.Latitude, this.eventDetail.Venue.Longitude),
                map: this.VenueMap,
                title: this.eventDetail.Venue.VenueName,
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

    coupleCalculation(type: string) {
        switch (type) {
            case 'add':
                if (this.couples < (this.eventDetail.Attendees / 2)) {
                    this.couples++;
                }
                break;
            case 'sub':
                if (this.couples > 1) {
                    this.couples--;
                }
                break;
            default:
        }

        this.amount = this.eventDetail.PricePerCouple * this.couples;
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

    pay_now() {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.makePayment();
        /*var User: any = localStorage.getItem("User");

        User = JSON.parse(User);
        var post = {
            "DealID": this.eventDetail.DealID,
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
        );*/
    }

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    SaveRoom() {        
        if (this.selectedRoom) {
            var saveRoomMateRequest = {
                "DealID": this.eventDetail.DealID,
                "ProposalID": this.eventDetail.ProposalID,
                "UserID": this.globalService.UserID,
                "IsNewRoom": this.selectedRoom.IsNewRoom,
                "RoomMateID": this.selectedRoom.Id,
                "RoomPax": this.selectedRoom.Pax
            };
            this.loading = true;
            this.appService.Post("/api/Zoho/SaveRoomMate", saveRoomMateRequest)
                .subscribe(data => {
                    this.loading = false;
                    this.toastr.success("Roommate saves successfully.", "Success");
                    this.ShowRoomOption = false;
                    this.FetchInvitees(this.eventDetail.DealID);
                },
                    (err: HttpErrorResponse) => {
                        console.log(err.message);
                        this.toastr.error(err.message, "Error");
                        this.loading = false;
                    }
                );
        }
    }

    makePayment() {
        var description = "";
        if (this.IsAdmin || true) {
            description = this.description;
        }
        else {
            description = "Paid $" + this.amount + " for " + this.couples + " couples.";
        }

        var pay = {
            "ProposalID": this.eventDetail.ProposalID,
            "ContactID": this.globalService.UserID,
            "TransactionID": this.makeid(10).toUpperCase(),
            "TransactionStatus": "Success",
            "TransactionMessage": description,
            "Amount": this.amount,
            "BookingAmount": 0
        };

        this.appService.Post("/api/Zoho/SaveProposalTransaction", pay)
            .subscribe(data => {
                this.loading = false;
                this.toastr.success("Payment transaction saved successfully.", "Success");
                this.amount = 0;
                this.description = '';
                this.couples = 1;
                this.showPayment = false;
                this.showMobilePayment = false;
                this.FetchInvitees(this.eventDetail.DealID);
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.toastr.error(err.message, "Error");
                    this.loading = false;
                }
            );
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

    sendInvites() {
        if (this.attendeeCtrl.value)
            this.attendees.push(this.attendeeCtrl.value);
        if (this.adminCtrl.value)
            this.admins.push(this.adminCtrl.value);

        if (this.attendees.length > 0 || this.admins.length > 0) {

            var post_data = {
                "DealID": this.eventDetail.DealID,
                "DealName": this.eventDetail.DealName,
                "Emails": this.attendees,
                "AdminEmails": this.admins
            };

            this.attendeeInput.nativeElement.value = '';
            this.adminInput.nativeElement.value = '';

            this.loading = true;
            this.appService.Post("api/Zoho/InviteAttendees", post_data)
                .subscribe(data => {
                    var response = data as any;
                    if (response.Status) {
                        var message = "";
                        if (response.SuccessCount > 0) {
                            message = response.SuccessCount + " Invite(s) sent successfully. ";
                        }
                        if (response.FaildCount > 0) {
                            message += response.FaildCount + " Invite(s) failed.";
                        }
                        this.toastr.success(message, "Success");
                    }
                    else {
                        this.toastr.error(response.Message, "Error");
                    }
                    this.attendees = [];
                    this.admins = [];
                    this.attendeeCtrl.setValue('');
                    this.adminCtrl.setValue('');
                    this.attendeeInput.nativeElement.value = '';
                    this.adminInput.nativeElement.value = '';
                    this.loading = false;
                },
                    (err: HttpErrorResponse) => {
                        this.attendees = [];
                        this.admins = [];
                        this.attendeeCtrl.setValue('');
                        this.adminCtrl.setValue('');
                        this.attendeeInput.nativeElement.value = '';
                        this.adminInput.nativeElement.value = '';
                        this.loading = false;
                        this.toastr.error("Some internal error occur, Please try again.", "Error");
                    }
                );
        }
    }

    MakePayment() {
        this.IsDeposit = false;
        this.showPayment = true;
        if (!this.IsAdmin) {
            this.couples = 1;
            this.amount = this.eventDetail.PricePerCouple * this.couples;
        }
        this.cardError = null;
        this.mobileCardError = null;
        this.bookingFeeAmount = this.paidAmount > 0 ? 0 : this.eventDetail.BookingFeeAmount;
        this.creditCardCharges = (this.eventDetail.PricePerCouple - this.paidAmount) * (this.eventDetail.CardFeePercentage / 100);        
        this.amount = Math.round((this.eventDetail.PricePerCouple - this.paidAmount) * 100) / 100;
        this.maxAmount = this.amount;
        //if (!this.cardCreated) {
        setTimeout(() => {
            this.cardCreated = true;
            this.cardHandler = this.onChange.bind(this);
            this.initiateCardElement();
        }, 1000);
        //}
    }

    MakeDepositPayment() {
        this.IsDeposit = true;
        this.showPayment = true;
        if (!this.IsAdmin) {
            this.couples = 1;
            this.amount = (this.eventDetail.PricePerCouple * this.couples);
            this.maxAmount = this.eventDetail.AdminContribution - this.paidDepositAmount;
        }
        else {
            this.bookingFeeAmount = 0;
            this.creditCardCharges = ((this.eventDetail.AdminContribution - this.paidDepositAmount) - this.paidAmount) * (this.eventDetail.CardFeePercentage / 100);
            this.amount = Math.round(((this.eventDetail.AdminContribution - this.paidDepositAmount) - this.paidAmount) * 100) / 100;
            this.maxAmount = this.amount;
        }
        this.cardError = null;
        this.mobileCardError = null;
        
        setTimeout(() => {
            this.cardCreated = true;
            this.cardHandler = this.onChange.bind(this);
            this.initiateCardElement();
        }, 1000);
    }

    PaymentValueChange(newValue) {
        this.creditCardCharges = newValue * (this.eventDetail.CardFeePercentage / 100);        
    }

    MakeMobilePayment() {
        this.IsDeposit = false;
        this.view_payment_history = false;
        this.showMobilePayment = true;
        if (!this.IsAdmin) {
            this.couples = 1;
            this.amount = this.eventDetail.PricePerCouple * this.couples;
        }
        this.cardError = null;
        this.mobileCardError = null;
        this.amount = Math.round((this.eventDetail.PricePerCouple + 6.99 + 3.75 - this.paidAmount) * 100) / 100;
        this.maxAmount = this.amount;
        //if (!this.cardCreated) {
        setTimeout(() => {
            this.MobileCardCreated = true;
            this.mobileCardHandler = this.onChange.bind(this);
            this.initiateMobileCardElement();
        }, 1000);
        //}
    }

    changeDeposit(isDeposit) {
        this.IsDeposit = isDeposit;
    }
}