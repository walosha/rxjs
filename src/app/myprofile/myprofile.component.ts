import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse  } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-myprofile',
    templateUrl: './myprofile.component.html',
    styleUrls: ['./myprofile.component.css']
})

export class MyProfileComponent implements OnInit {
    registerForm: FormGroup;
    filteredUniversities: any;
    filteredOrganizations: any;
    filteredChapters: any;
    filteredChapters2: any;
    url: any = 'assets/img/john.png';
    UserName: string;
    UsernameError: string = "";
    EmailError: string = "";
    PhoneError: string = "";
    UserId: string = "";
    public phoneMask = ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

    loading: boolean = false;
    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private globalService: GlobalService, private toastr: ToastrService) { }
    ngOnInit() {
        if (this.globalService.UserID == '' && this.globalService.UserID == undefined) {
            this.router.navigate(['/login']);
        }
        this.UsernameError = '';        
        this.registerForm = this.fb.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', Validators.required],
            username: ['', Validators.required],            
            phone: ['', Validators.required],
            university: ['', Validators.required],
            organization: ['', Validators.required],
            birthDate: ['', Validators.required],
            position: ['', Validators.required],
            isSubscribe: true,
            isAgree: true
        });

        this.filteredUniversities = this.registerForm.get('university').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchUniversity({ url: "api/Zoho/GetUniversities", name: value }, 1)));

        this.filteredUniversities = this.appService.searchUniversity({ url: "api/Zoho/GetUniversities", name: "" }, 1);

        this.filteredOrganizations = this.registerForm.get('organization').valueChanges.pipe(debounceTime(300), switchMap((value: string) =>
            this.appService.searchOrganization({ url: "api/Zoho/GetOrganizations", name: value }, 1)));

        this.filteredOrganizations = this.appService.searchOrganization({ url: "api/Zoho/GetOrganizations", name: "" }, 1);

        var user = localStorage.getItem("User");
        if (user != undefined) {
            var jsonUser = JSON.parse(user);
            this.UserName = jsonUser.Full_Name;
            this.UserId = jsonUser.id;
            this.registerForm.patchValue({
                firstname: jsonUser.First_Name,
                lastname: jsonUser.Last_Name,
                email: jsonUser.Email,
                phone: jsonUser.Mobile,
                position: jsonUser.Position_Held,
                username: jsonUser.Username,
                birthDate: jsonUser.Date_of_Birth
            });
            if (jsonUser.University != null) {
                this.registerForm.patchValue({
                    university: jsonUser.University.id
                });
            }
            if (jsonUser.Organisation != null) {
                this.registerForm.patchValue({
                    organization: jsonUser.Organisation.id
                });
            }
        }
        else {
            this.router.navigate(['/login']);
        }
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

    //Register button client event 
    SaveProfile(registerForm: FormGroup) {
        this.loading = true;
        setTimeout(() => {
            var date = new Date(registerForm.value.birthDate);
            registerForm.value.birthDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
            registerForm.value.Id = this.UserId;
            this.appService.Post("API/Zoho/SaveProfile", registerForm.value)
                .subscribe(data => {
                    this.loading = false;
                    var response = data as any;
                    if (response.status == "success") {
                        localStorage.setItem('User', JSON.stringify(response.user));                        
                        this.toastr.success('Profile info saved successfully.', 'Success');
                        this.loading = false;
                    }
                    else {
                        this.UsernameError = response.Message;
                    }
                },
                (err: HttpErrorResponse) => {
                    this.loading = false;
                    console.log(err.message);
                }
            );
        }, 1000);
    }

    SocialLogin() {        
        //this.authenticationService.login('', '');
        //this.router.navigate(['/events']);
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
                    /**
                    // You could upload it like this:
                    const formData = new FormData()
                    formData.append('logo', file, relativePath)
           
                    // Headers
                    const headers = new HttpHeaders({
                      'security-token': 'mytoken'
                    })
           
                    this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
                    .subscribe(data => {
                      // Sanitized logo returned from backend
                    })
                    **/

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

    /// Validate username exist or not
    UsernameValidate(registerForm: FormGroup) {
        var model = {
            To: registerForm.value.username
        };
        this.appService.Post("API/Zoho/ValidateUser", model)
            .subscribe(data => {
                var response = data as any;
                if (response.status != "success") {
                    this.UsernameError = "Username Already Exists.";
                }
                else {
                    this.UsernameError = "";
                }
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                }
            );
    }

    /// Validate email address exist or not
    EmailValidate(registerForm: FormGroup) {
        var model = {
            To: registerForm.value.email
        };
        this.appService.Post("API/Zoho/ValidateUser", model)
            .subscribe(data => {
                var response = data as any;
                if (response.status != "success") {
                    this.EmailError = "Email Address Already Exists.";
                }
                else {
                    this.EmailError = "";
                }
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                }
            );
    }

    /// Validate username exist or not
    PhoneValidate(registerForm: FormGroup) {
        var model = {
            To: registerForm.value.phone
        };
        this.appService.Post("API/Zoho/ValidateUser", model)
            .subscribe(data => {
                var response = data as any;
                if (response.status != "success") {
                    this.PhoneError = "Phone Number Already Exists.";
                }
                else {
                    this.PhoneError = "";
                }
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                }
            );
    }

    /// show selected name in autocomplete
    displayFn(selected: any) {
        if (selected) { return selected.name; }
    }
}