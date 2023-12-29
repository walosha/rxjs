import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-about-us',
    templateUrl: './aboutus.component.html',
    styleUrls: ['./aboutus.component.css']
})

export class AboutUsComponent implements OnInit {    
    constructor(private fb: FormBuilder, private httpClient: HttpClient) { }
    
    ngOnInit() {
        
    }
}
