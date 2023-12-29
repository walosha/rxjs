import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse  } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../services/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-contact-us',
    templateUrl: './contactus.component.html',
    styleUrls: ['./contactus.component.css']
})

export class ContactUsComponent implements OnInit {
    contactForm: FormGroup;
    loading: boolean = false;
    public phoneMask = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    constructor(private fb: FormBuilder, private appService: AppService, private toastr: ToastrService) { }

    ngOnInit() {
        this.contactForm = this.fb.group({
            FirstName: ['', Validators.required],
            LastName: ['', Validators.required],
            University: ['', Validators.required],
            Email: ['', Validators.required],
            Phone: ['', [Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/), Validators.required]],
            DateOfEvent: ['', Validators.required],
            NumberofPeople: ['', Validators.required],
            Destination: ['', Validators.required],
            TypeofEvent: ['', Validators.required],
            Budget: ['', Validators.required],
            Message: ['', Validators.required]
        });
    }

    SaveContact(contactForm: FormGroup) {
        this.loading = true;
        setTimeout(() => {
            var date = new Date(contactForm.value.DateOfEvent);
            contactForm.value.DateOfEvent = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();            
            this.appService.Post("API/Zoho/SaveContact", contactForm.value)
                .subscribe(data => {                    
                    var response = data as any;
                    if (response.status == "success") {                        
                        this.toastr.success(response.message, "Success");
                        this.contactForm.reset();
                        this.loading = false;                        
                    }
                    else {
                        this.toastr.error(response.message, "Error");
                        this.contactForm.reset();
                        this.loading = false;
                    }
                },
                    (err: HttpErrorResponse) => {
                        this.loading = false;
                        console.log(err.message);
                    }
                );
        }, 1000);
    }
}
