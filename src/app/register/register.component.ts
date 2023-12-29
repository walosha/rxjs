import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { AuthenticationService } from '../services/authentication.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    filteredUniversities: any;
    filteredOrganizations: any;
    filteredChapters: any;
    filteredChapters2: any;
    UsernameError: string = "";
    EmailError: string = "";
    PhoneError: string = "";
    showOtp: boolean = false;
    phoneValidated: boolean = false;
    url: any;
    loading: boolean = false;
    public phoneMask = ['1', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    constructor(private fb: FormBuilder, protected router: Router, private appService: AppService, private globalService: GlobalService, private authenticationService: AuthenticationService, private toastr: ToastrService) { }
    ngOnInit() {
        this.UsernameError = '';

        this.registerForm = this.fb.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])],
            username: ['', Validators.required],
            password: [''],
            confirmPassword: [''],
            phone: ['', Validators.compose([Validators.required, Validators.pattern("[- +()0-9]{10,15}")])],
            phoneOTP: [''],
            university: ['', Validators.required],
            organization: ['', Validators.required],
            birthDate: [''],
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

        var sessionValue = localStorage.getItem("ConfirmDetail");
        if (sessionValue != '' && sessionValue != undefined) {
            var sessionObject = JSON.parse(sessionValue);
            this.registerForm.patchValue({
                university: sessionObject.university,
                organization: sessionObject.organization
            });
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
                    this.toastr.error("Username Already Exists.", "Error");
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
                    this.toastr.error("Email Address Already Exists.", "Error");
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
                    this.toastr.error("Phone Number Already Exists.", "Error");

                }
                else {
                    this.PhoneError = "";
                    this.SendOTP(registerForm);
                }
            },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                }
            );
    }

    SendOTP(registerForm: FormGroup) {
        this.loading = true;

        var model = {
            To: registerForm.value.phone,
            Logintype: 'sms'
        };

        this.appService.Post("API/Twilio/SendRegisterOTP", model)
            .subscribe(data => {
                this.loading = false;
                var response = data as any;
                if (response.status == "pending") {
                    this.showOtp = true;
                    this.registerForm.controls['phoneOTP'].setValidators([Validators.required]);
                    this.registerForm.controls['phoneOTP'].updateValueAndValidity();
                }
                else {
                    this.toastr.error("Please enter valid phone number.", "Error");
                }
            },
            (err: HttpErrorResponse) => {
                this.loading = false;
                console.log(err.message);
            }
        );
    }

    Verify(registerForm: FormGroup) {
        this.loading = true;
        var model = {
            To: registerForm.value.phone,
            Logintype: 'sms',
            Code: registerForm.value.phoneOTP
        };
        this.appService.Post("API/Twilio/VerifyRegisterOTP", model)
            .subscribe(data => {
                this.loading = false;
                var response = data as any;
                if (response.VerificationCheck.status == "approved") {
                    this.phoneValidated = true;
                    this.showOtp = false;                    
                }
                else {
                    this.toastr.error("Please enter valid opt.", "Error");                    
                }
            },
            (err: HttpErrorResponse) => {
                this.loading = false;
                console.log(err.message);
            }
        );
    }

    //Register button client event 
    Register(registerForm: FormGroup) {
        this.loading = true;
        setTimeout(() => {
            var date = new Date(registerForm.value.birthDate);
            registerForm.value.birthDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
            this.appService.Post("API/Zoho/Register", registerForm.value)
                .subscribe(data => {
                    this.loading = false;
                    var response = data as any;
                    if (response.Status) {
                        if (response.UserID != null) {
                            this.appService.Get("API/Zoho/GetUser/" + response.UserID)
                                .subscribe(userData => {
                                    var userResponse = userData as any;
                                    this.globalService.UserID = response.User.id;
                                    this.globalService.UserName = response.User.Full_Name;
                                    this.globalService.createCookie("UserID", response.User.id, 15);
                                    this.globalService.createCookie("UserName", response.User.Full_Name, 15);
                                    localStorage.setItem("User", JSON.stringify(userResponse));
                                    this.authenticationService.login('', '');
                                    this.router.navigate(['/myevent']);
                                },
                                (err: HttpErrorResponse) => {
                                    this.loading = false;
                                    console.log(err.message);
                                })
                        }
                        else {
                            this.router.navigate(['/login']);
                        }
                    }
                    else {
                        this.toastr.error(response.Message, "Error");
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
