import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacypolicy.component.html',
    styleUrls: ['./privacypolicy.component.css']
})

export class PrivacyPolicyComponent implements OnInit {    
    constructor(private fb: FormBuilder, private httpClient: HttpClient) { }
    
    ngOnInit() {
        
    }
}
