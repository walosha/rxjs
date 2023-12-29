import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { AppService } from '../services/app.service';
import { AuthenticationService } from '../services/authentication.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

@Component({
    selector: 'app-eventregister',
    templateUrl: './eventregister.component.html',
    styleUrls: ['./eventregister.component.css']
})

export class EventRegisterComponent implements OnInit {       
    registerForm: FormGroup;
    filteredUniversities: any;
    filteredOrganizations: any;
    filteredChapters: any;
    filteredChapters2: any;
    url: any;
    public phoneMask = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private authenticationService: AuthenticationService) {
        
    }    
    ngOnInit() {
        this.registerForm = this.fb.group({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            university: '',
            organization: '',
            chapter: '',
            chapter2: '',
            isSubscribe: false,
            isAgree: false
        }); 
        
        this.filteredUniversities = this.registerForm.get('university').
            valueChanges.
            pipe(
            debounceTime(300),
            switchMap((value: string) => this.appService.searchUniversity({ url: "api/Zoho/GetUniversities", name: value }, 1)));

        this.filteredOrganizations = this.registerForm.get('organization').
            valueChanges.
            pipe(
            debounceTime(300),
            switchMap((value: string) => this.appService.searchOrganization({ url: "api/Zoho/GetOrganizations", name: value }, 1)));

        this.filteredChapters = this.registerForm.get('chapter').
            valueChanges.
            pipe(
            debounceTime(300),
            switchMap((value: string) => this.appService.searchChapter({ name: value }, 1)));

        this.filteredChapters2 = this.registerForm.get('chapter2').
            valueChanges.
            pipe(
            debounceTime(300),
            switchMap((value: string) => this.appService.searchChapter2({ name: value }, 1)));

        this.registerForm.patchValue({
            email: 'pauljackson@gmail.com',
            university: { "id": 74, "name": "Auburn University" },
            organization: { "id": 56, "name": "Kappa Sigma - ΚΣ" },
            chapter: { "id": 2, "name": "Beta" },
            chapter2: { "id": 7, "name": "Eta" },
        });
    }  

    onSelectFile(event: any) { // called each time file input changes
        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();

            reader.readAsDataURL(event.target.files[0]); // read file as data url

            reader.onload = (event: any) => { // called once readAsDataURL is completed
                this.url = event.target.result;
            }
        }
    } 

    SocialLogin() {
        this.authenticationService.login('', '');
        this.router.navigate(['/events']);
    }

    public files: NgxFileDropEntry[] = [];

    public dropped(files: NgxFileDropEntry[]) {
        this.files = files;
        for (const droppedFile of files) {
            // Is it a file?
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                const reader = new FileReader();
                fileEntry.file((file: File) => {
                    // Here you can access the real file
                    console.log(droppedFile.relativePath, file);
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        this.url = reader.result;
                    };
                });
            } else {
                // It was a directory (empty directories are added, otherwise only files)
                const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
                console.log(droppedFile.relativePath, fileEntry);
            }
        }
    }

    public fileOver(event) {
        console.log(event);
    }

    public fileLeave(event) {
        console.log(event);
    }

    /// show selected name in autocomplete
    displayFn(selected: any) {
        if (selected) { return selected.name; }
    }
}
