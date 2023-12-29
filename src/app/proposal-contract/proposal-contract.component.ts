import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {MatChipInputEvent} from '@angular/material/chips';


import { AppService } from '../services/app.service';

//const Swal = require('sweetalert2');

@Component({
    selector: 'app-proposal-contract',
    templateUrl: './proposal-contract.component.html',
    styleUrls: ['./proposal-contract.component.css']
})
export class ProposalContractComponent implements OnInit {
    dealId: any;
    loading: boolean = false;
    contract_terms = [
        {
            term: 'One of our representatives will call you to confirm details'
        }, {
            term: 'You will see notification once we send the contract'
        }, {
            term: 'You will receive a contract on your registered Email for Signature'
        }, {
            term: 'This process takes approx. 24 hours'
        }
    ]

    constructor(private fb: FormBuilder, protected router: Router, private httpClient: HttpClient, private appService: AppService) {

    }

    ngOnInit() {

        this.dealId = localStorage.getItem("StartPlanningDealID");
        if (this.dealId == undefined) {
            this.router.navigate(['/adminevent']);
        }
    }

    StartPlanning() {
        this.loading = true;
        this.appService.Post("API/Zoho/SubmitDeal", { Id: this.dealId })
            .subscribe(data => {
                this.loading = false;
                localStorage.removeItem("StartPlanningDealID");
                this.router.navigate(['/adminevent']);
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }
}
