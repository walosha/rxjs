import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse  } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-approve-hotel',
    templateUrl: './approvehotel.component.html',
    styleUrls: ['./approvehotel.component.css']
})

export class ApproveHotelComponent implements OnInit {
    hotelAcceptForm: FormGroup;
    loading: boolean = false;
    proposalHotel: any;
    proposalId: any;        
    constructor(private fb: FormBuilder, protected router: Router, public route: ActivatedRoute, private appService: AppService, private toastr: ToastrService) { }

    ngOnInit() {
        this.hotelAcceptForm = this.fb.group({
            RoomRates: [0, Validators.required],
            FirstName: ['', Validators.required],
            LastName: ['', Validators.required],
            Accept: false
        });

        this.route.params.subscribe(res => {
            if (res) {
                if (res['ProposalID']) {
                    this.proposalId = res['ProposalID'];
                    this.LoadProposalHotel(this.proposalId);
                }
                else {
                    this.router.navigate(['/']);
                }
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    LoadProposalHotel(id) {
        this.loading = true;
        this.appService.Get("/api/Zoho/GetProposalHotel/" + id)
            .subscribe(data => {
                this.proposalHotel = data as any;
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

    Accept(hotelAcceptForm: FormGroup, isApprove: boolean) {
        this.loading = true;
        var proposal = {
            Id: this.proposalHotel.Id,
            RoomRates: hotelAcceptForm.value.RoomRates,
            IsApprove: isApprove,
            HotelRemarks: hotelAcceptForm.value.RoomRates > this.proposalHotel.HotelPrice ? "Rejected by System" : (isApprove ? "Accepted By Hotel" : "Rejected By Hotel")
        }
        this.appService.Post("API/Zoho/ApproveOrRejectHotel", proposal)
            .subscribe(data => {
                var response = data as any;
                if (response.status == "success") {
                    this.toastr.success(response.message, "Success");
                    this.hotelAcceptForm.reset();
                    this.loading = false;
                    this.LoadProposalHotel(this.proposalId);
                }
                else {
                    this.toastr.error(response.message, "Error");
                    this.hotelAcceptForm.reset();
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
