import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';

@Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.css']
})

export class BlogDetailComponent implements OnInit {  
    blog: any;
    blogs: any;  
    constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router) { }
    
    ngOnInit() {        
        var blog = localStorage.getItem("Blog");
        if (!(blog != '' && blog != undefined)) {
            this.router.navigate(['/blogs']);
        }

        /// Load hotel detail from json
        this.httpClient.get("assets/json/blogs.json").subscribe(
            data => {
                this.blogs = data as any;
                this.blog = this.blogs.filter(x => x.ID == blog)[0];
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
            }
        );
    }
}
