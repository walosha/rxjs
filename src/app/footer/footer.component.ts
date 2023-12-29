import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationStart } from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
    build: any;
    blogs: any;
    anio: number = new Date().getFullYear();
    constructor(private httpClient: HttpClient, private router: Router) {

    }

    ngOnInit() {

        this.build = { make: "" }; 

        this.httpClient.get("assets/json/buildinfo.json").subscribe(
            data => {
                this.build = data as string;
                // console.log(this.build);
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
            }
        );

        /// Load blogs detail from json
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
        this.router.navigate(['/blog-detail'], {
            queryParams: { id: blog.ID }
        });
    }

}
