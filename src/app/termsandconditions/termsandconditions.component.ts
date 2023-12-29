import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-terms-and-conditions',
    templateUrl: './termsandconditions.component.html',
    styleUrls: ['./termsandconditions.component.css']
})

export class TermsAndConditionsComponent implements OnInit {    
    constructor(private fb: FormBuilder, private httpClient: HttpClient) { }
    
    ngOnInit() {
        
    }
}
