import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { AuthenticationService } from '../services/authentication.service';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';

import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexResponsive,
    ApexXAxis,
    ApexLegend,
    ApexFill,
    ApexGrid,
    ApexTooltip,
    ApexYAxis,
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
    toolTip: ApexTooltip
};

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loginError = null;
    enterOpt: boolean = false;
    selectLoginType: boolean = false;
    Phone: string;
    Email: string;
    DisplayEmail: string;
    DisplayPhone: string;
    loading: boolean = false;
    public phoneMask = ['1', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]

    @ViewChild("chart") chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    constructor(private fb: FormBuilder, protected router: Router, private authenticationService: AuthenticationService, private appService: AppService, protected globalService: GlobalService) { }

    ngOnInit() {
        this.loginForm = this.fb.group({
            email: [''],
            phone: ['', Validators.compose([Validators.required, Validators.pattern("[- +()0-9]{10,15}")])],
            username: [''],
            code: [''],
            InputType: ['1'],
            Logintype: [''],
            DeviceType: [''],
            password: [''],
            rememberMe: false
        });

        // this.FetchDetail();

        this.chartOptions = {
            series: [
                {
                    name: "PRODUCT A",
                    data: [5000],
                    highest: false
                },
                {
                    name: "PRODUCT B",
                    data: [10000],
                    highest: false,
                }
            ],
            chart: {
                type: "bar",
                height: 350,
                stacked: true,
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                },

            },
            responsive: [
                {
                    breakpoint: 0,
                    options: {
                        legend: {
                            position: "bottom",
                            offsetX: 100,
                            offsetY: 0
                        }
                    }
                }
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                    rangeBarOverlap: false
                }
            },
            xaxis: {
                type: "category",
                categories: [
                    "01/2011"
                ],
                labels: {
                    show: false,
                },
                title: {
                    text: ''
                },
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },


            },
            yaxis: {
                opposite: true,
                labels: {
                    show: false
                },
                title: {
                    text: '',
                },
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                crosshairs: {
                    show: false
                },


            },
            legend: {
                position: "right",
                offsetY: 40,
                show: false
            },
            fill: {
                opacity: 1
            },
            dataLabels: {
                enabled: true,

            },
            grid: {
                show: false,
                xaxis: {
                    lines: {
                        show: false  //or just here to disable only x axis grids
                    }
                },
                yaxis: {
                    lines: {
                        show: false  //or just here to disable only y axis
                    }
                }
            },
            toolTip: {
                // enabled: false,
                // marker: {
                //     show: false,
                // },
                // x: {
                //     show: false,
                // }
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    // var data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                    console.log(w.globals.initialSeries[seriesIndex].highest);
                    return '<ul style="padding: 10px;">' +
                        '<li><b>Price</b>: ' + 'one' + '</li>' +
                        '<li><b>Amount</b>: ' + w.globals.initialSeries[seriesIndex].data[0] + '</li>' +
                        '</ul>';
                }
            }
        };

        this.loginForm.get('InputType').valueChanges.subscribe(val => {
            if (val == "1") {
                this.loginForm.controls['phone'].setValidators([Validators.required, Validators.pattern("[- +()0-9]{10,15}")]);
                this.loginForm.controls['username'].clearValidators();
                this.loginForm.controls['email'].clearValidators();
            } else if (val == "2") {
                this.loginForm.controls['email'].setValidators([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]);
                this.loginForm.controls['username'].clearValidators();
                this.loginForm.controls['phone'].clearValidators();
            } else {
                this.loginForm.controls['username'].setValidators([Validators.required]);
                this.loginForm.controls['email'].clearValidators();
                this.loginForm.controls['phone'].clearValidators();
            }
            this.loginForm.controls['phone'].updateValueAndValidity();
            this.loginForm.controls['email'].updateValueAndValidity();
            this.loginForm.controls['username'].updateValueAndValidity();
        });
    }

    /// Login button click event
    Login(loginForm: FormGroup) {
        this.loading = true;
        setTimeout(() => {
            var to = '';
            if (loginForm.value.InputType == "1") {
                to = loginForm.value.phone
            } else if (loginForm.value.InputType == "2") {
                to = loginForm.value.email
            } else {
                to = loginForm.value.username
            }
            var model = {
                To: to
            };
            this.loginError = "";
            this.appService.Post("API/Twilio/GetLoginUser", model)
                .subscribe(data => {
                    this.loading = false;
                    var response = data as any;
                    if (response.Status) {
                        this.selectLoginType = true;
                        this.Phone = response.Phone;
                        this.Email = response.Email;
                        if (response.Email != null)
                            this.DisplayEmail = this.obscure(response.Email);
                        if (response.Phone != null)
                            this.DisplayPhone = this.obscure(response.Phone);
                    }
                    else {
                        this.loginError = response.Message;
                    }
                },
                    (err: HttpErrorResponse) => {
                        this.loading = false;
                        console.log(err.message);
                    }
                );
        }, 1000);

    }

    obscure(source: string) {
        return `${source[0]}${source[1]}${new Array(source.length).join("*")}${source[source.length - 2]}${source[source.length - 1]}`;
    };

    /// Login button click event
    SendOTP(loginForm: FormGroup) {
        this.loading = true;
        setTimeout(() => {
            var model = {
                To: loginForm.value.Logintype == "email" ? this.Email : this.Phone,
                Logintype: loginForm.value.Logintype
            };
            this.loginError = "";
            this.appService.Post("API/Twilio/SendOTP", model)
                .subscribe(data => {
                    this.loading = false;
                    var response = data as any;

                    if (response.status == "pending") {
                        this.enterOpt = true;
                        this.selectLoginType = false;
                        this.Phone = response.to;
                    }
                    else {
                        this.loginError = "Mobile Number is not registered.";
                    }
                },
                    (err: HttpErrorResponse) => {
                        this.loading = false;
                        console.log(err.message);
                    }
                );
        }, 1000);

    }

    Verify(loginForm: FormGroup) {
        this.loading = true;
        setTimeout(() => {
            var model = {
                To: loginForm.value.Logintype == "email" ? this.Email : this.Phone,
                Logintype: loginForm.value.Logintype,
                Code: loginForm.value.code
            };
            this.appService.Post("API/Twilio/VerifyOTP", model)
                .subscribe(data => {
                    this.loading = false;
                    var response = data as any;
                    if (response.VerificationCheck.status == "approved") {
                        this.loginError = null;
                        this.globalService.UserID = response.User.id;
                        this.globalService.UserName = response.User.Full_Name;
                        var time = loginForm.value.DeviceType == "1" ? (60 * 24 * 30) : 15;
                        this.globalService.createCookie("UserID", response.User.id, time);
                        this.globalService.createCookie("UserName", response.User.Full_Name, time);
                        localStorage.setItem("User", JSON.stringify(response.User));
                        this.authenticationService.login(loginForm.value.email, loginForm.value.code);
                        this.globalService.SetIsAdminAccount(response.IsAdmin);
                        if (localStorage.getItem("IsConfirmDetailScreen") == "1") {
                            localStorage.removeItem("IsConfirmDetailScreen");
                            this.router.navigate(['/confirm']);
                        }
                        else {
                            var InvitedDealId = localStorage.getItem('InvitedDealId');

                            if (InvitedDealId) {
                                this.router.navigate(['/deal/' + InvitedDealId]);
                            }
                            else {
                                if (response.IsAdmin) {
                                    this.router.navigate(['/adminevent']);
                                }
                                else {
                                    this.router.navigate(['/myevent']);
                                }
                            }

                        }
                    }
                    else {
                        this.loginError = "Please enter valid OPT";
                    }
                },
                    (err: HttpErrorResponse) => {
                        this.loading = false;
                        console.log(err.message);
                    }
                );
        }, 1000);
    }

    SocialLogin() {
        this.authenticationService.login('', '');
        this.router.navigate(['/events']);
    }
}