import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-approve-venue',
    templateUrl: './approvevenue.component.html',
    styleUrls: ['./approvevenue.component.css']
})

export class ApproveVenueComponent implements OnInit {
    venueAcceptForm: FormGroup;
    loading: boolean = false;
    proposalVenue: any;
    proposalId: any;
    constructor(private fb: FormBuilder, protected router: Router, public route: ActivatedRoute, private appService: AppService, private toastr: ToastrService) { }

    ngOnInit() {
        this.venueAcceptForm = this.fb.group({            
            FirstName: ['', Validators.required],
            LastName: ['', Validators.required],
            Accept: false
        });

        this.route.params.subscribe(res => {
            if (res) {
                if (res['ProposalID']) {
                    this.proposalId = res['ProposalID'];
                    this.LoadProposalVenue(this.proposalId);
                }
                else {
                    this.router.navigate(['/']);
                }
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    LoadProposalVenue(id) {
        this.loading = true;
        this.appService.Get("/api/Zoho/GetProposalVenue/" + id)
            .subscribe(data => {
                this.proposalVenue = data as any;
                this.loading = false;
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    this.loading = false;
                }
            );
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

    Accept(venueAcceptForm: FormGroup, isApprove: boolean) {
        this.loading = true;
        var proposal = {
            Id: this.proposalVenue.Id,            
            IsApprove: isApprove,
            VenueRemarks: (isApprove ? "Accepted By Venue" : "Rejected By Venue")
        }
        this.appService.Post("API/Zoho/ApproveOrRejectVenue", proposal)
            .subscribe(data => {
                var response = data as any;
                if (response.status == "success") {
                    this.toastr.success(response.message, "Success");
                    this.venueAcceptForm.reset();
                    this.loading = false;
                    this.LoadProposalVenue(this.proposalId);
                }
                else {
                    this.toastr.error(response.message, "Error");
                    this.venueAcceptForm.reset();
                    this.loading = false;
                }
            },
                (err: HttpErrorResponse) => {
                    this.loading = false;
                    console.log(err.message);
                }
            );
    }
}
