import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';

@Component({
    selector: 'app-blogs',
    templateUrl: './blogs.component.html',
    styleUrls: ['./blogs.component.css']
})

export class BlogsComponent implements OnInit {  
    blogs: any;
      
    constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router) { }
    
    ngOnInit() {
        /// Load hotel detail from json
        this.httpClient.get("assets/json/blogs.json").subscribe(
            data => {
                this.blogs = data as any;
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
            }
        );
    }

    SelectBlog(blog: any) {
        localStorage.setItem("Blog", blog.ID);
        this.router.navigate(['/blog-detail']);
    }
}
