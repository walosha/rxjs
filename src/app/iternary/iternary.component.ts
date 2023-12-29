import { Component, OnInit, HostListener, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Gallery, GalleryItem, ImageItem, ThumbnailsPosition, ImageSize } from '@ngx-gallery/core';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { } from 'googlemaps';
declare let html2canvas: any;
import { jsPDF } from "jspdf";
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-iternary',
    templateUrl: './iternary.component.html',
    styleUrls: ['./iternary.component.css']
})

export class IternaryComponent implements OnInit {
    loading: boolean = false;
    iternary: any;
    IsAdmin: boolean = false;
    CurrentIndex: number = 1;
    hotelImages: GalleryItem[];
    venueImages: GalleryItem[];
    @ViewChild(SignaturePad) signaturePad: SignaturePad;
    private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        'minWidth': 1,
        'canvasWidth': 1100,
        'canvasHeight': 150,
        'penColor': "rgb(66, 133, 244)"
    };
    constructor(@Inject(DOCUMENT) private document: Document, protected router: Router, public route: ActivatedRoute, private appService: AppService, private globalService: GlobalService, private gallery: Gallery, private toastr: ToastrService) {
        
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        if (window.scrollY < document.getElementById('date-one').offsetTop) {
            document.getElementById('btn-day1').classList.remove('_active');
            document.getElementById('btn-day2').classList.remove('_active');
            document.getElementById('btn-day3').classList.remove('_active');
            document.getElementById('btn-info').classList.remove('_active');
            document.getElementById('date-one').classList.remove('_current-day-in-view');
            document.getElementById('date-two').classList.remove('_current-day-in-view');
            document.getElementById('date-three').classList.remove('_current-day-in-view');
            document.getElementById('info-section').classList.remove('_current-day-in-view');
        }
        if (window.scrollY > document.getElementById('date-one').offsetTop - 50) {
            document.getElementById('btn-day1').classList.add('_active');
            document.getElementById('btn-day2').classList.remove('_active');
            document.getElementById('btn-day3').classList.remove('_active');
            document.getElementById('btn-info').classList.remove('_active');
            document.getElementById('date-one').classList.add('_current-day-in-view');
            document.getElementById('date-two').classList.remove('_current-day-in-view');
            document.getElementById('date-three').classList.remove('_current-day-in-view');
            document.getElementById('info-section').classList.remove('_current-day-in-view');
        }
        if (window.scrollY > document.getElementById('date-two').offsetTop - 50) {
            document.getElementById('btn-day1').classList.remove('_active');
            document.getElementById('btn-day2').classList.add('_active');
            document.getElementById('btn-day3').classList.remove('_active');
            document.getElementById('btn-info').classList.remove('_active');
            document.getElementById('date-one').classList.remove('_current-day-in-view');
            document.getElementById('date-two').classList.add('_current-day-in-view');
            document.getElementById('date-three').classList.remove('_current-day-in-view');
            document.getElementById('info-section').classList.remove('_current-day-in-view');
        }
        if (window.scrollY > document.getElementById('date-three').offsetTop - 50) {
            document.getElementById('btn-day1').classList.remove('_active');
            document.getElementById('btn-day2').classList.remove('_active');
            document.getElementById('btn-day3').classList.add('_active');
            document.getElementById('btn-info').classList.remove('_active');
            document.getElementById('date-one').classList.remove('_current-day-in-view');
            document.getElementById('date-two').classList.remove('_current-day-in-view');
            document.getElementById('date-three').classList.add('_current-day-in-view');
            document.getElementById('info-section').classList.remove('_current-day-in-view');
        }
        if (window.scrollY > document.getElementById('info-section').offsetTop - 50) {
            document.getElementById('btn-day1').classList.remove('_active');
            document.getElementById('btn-day2').classList.remove('_active');
            document.getElementById('btn-day3').classList.remove('_active');
            document.getElementById('btn-info').classList.add('_active');
            document.getElementById('date-one').classList.remove('_current-day-in-view');
            document.getElementById('date-two').classList.remove('_current-day-in-view');
            document.getElementById('date-three').classList.remove('_current-day-in-view');
            document.getElementById('info-section').classList.add('_current-day-in-view');
        }
    }

    ngOnInit() {
        this.route.params.subscribe(res => {
            if (res) {
                if (res['ProposalID']) {
                    this.LoadProposal(res['ProposalID']);
                }
                else {
                    this.router.navigate(['/']);
                }
            } else {
                this.router.navigate(['/']);
            }
        });       
    }

    getAllErrors(form: FormGroup | FormArray): { [key: string]: any; } | null {
        let hasError = false;
        const result = Object.keys(form.controls).reduce((acc, key) => {
            const control = form.get(key);
            const errors = (control instanceof FormGroup || control instanceof FormArray)
                ? this.getAllErrors(control)
                : control.errors;
            if (errors) {
                acc[key] = errors;
                hasError = true;
            }
            return acc;
        }, {} as { [key: string]: any; });
        return hasError ? result : null;
    }

    goTo(index: number) {
        this.CurrentIndex = index;
        document.querySelector('#day' + index).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        //console.log(this.signaturePad.toDataURL());
        var signatureImage = this.signaturePad.toDataURL();
    }

    drawStart() {
        // will be notified of szimek/signature_pad's onBegin event
        console.log('begin drawing');
    }

    onApprove() {
        this.loading = true;
        html2canvas(document.querySelector("#capture")).then(canvas => {
            debugger;
            var imgData = canvas.toDataURL('image/png');

            var proposalAccept = {
                "Id": this.iternary.DealID,
                "ProposalID": this.iternary.ProposalID,
                "SignatureData": this.signaturePad.toDataURL(),
                "PageImageData": imgData,
                "IsApproved": true
            }

            this.appService.Post("API/Zoho/UpdateDealApproval", proposalAccept)
                .subscribe(data => {
                    var response = data as any;
                    if (response.status == "success") {
                        this.toastr.success(response.message, "Success");
                        this.loading = false;
                        localStorage.setItem("ProposalID", this.iternary.ProposalID);
                        this.router.navigate(['/events']);
                    }
                    else {
                        this.toastr.error(response.message, "Error");                        
                        this.loading = false;
                    }
                },
                    (err: HttpErrorResponse) => {
                        this.loading = false;
                        console.log(err.message);
                    }
                );

            //var doc = new jsPDF('l', 'mm');
            //doc.addImage(imgData, 'PNG', 10, 10, 1908, 3806);
            //doc.save('sample-file.png');

            //var a = document.createElement('a');
            //// toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
            //a.href = imgData.replace("image/png", "image/octet-stream");
            //a.download = 'somefilename.jpg';
            //a.click();

            //canvas.toBlob(function (blob) {

            //    //  just pass blob to something expecting a blob
            //    // somfunc(blob);

            //    // Same as canvas.toDataURL(), just longer way to do it.
            //    var reader = new FileReader();
            //    debugger;
            //    reader.readAsDataURL(blob);
            //    reader.onloadend = function () {
            //        let base64data = reader.result;
            //        console.log("Base64--> " + base64data);
            //    }
            //});
        });
    }

    onReject() {
        // Reject iternary
    }

    onClear() {
        this.signaturePad.clear();
    }
    
    LoadProposal(id) {
        this.loading = true;
        this.appService.Get("/api/Zoho/GetIternary/" + id)
            .subscribe(data => {
                this.iternary = data as any;
                this.iternary.HotelDefaultImage = this.iternary.HotelImages.filter(x => x.priority == 1);
                this.iternary.HotelOtherImage = this.iternary.HotelImages.filter(x => x.priority != 1);
                this.iternary.VenueDefaultImage = this.iternary.VenueImages.filter(x => x.priority == 1);
                this.iternary.VenueOtherImage = this.iternary.VenueImages.filter(x => x.priority != 1);
                this.hotelImages = this.iternary.HotelImages.map(item =>
                    new ImageItem({ src: item.url, thumb: item.url })
                );
                this.gallery.ref('hotelGallery').load(this.hotelImages);
                this.venueImages = this.iternary.VenueImages.map(item =>
                    new ImageItem({ src: item.url, thumb: item.url })
                );
                this.gallery.ref('venueGallery').load(this.venueImages);

                this.IsAdmin = this.iternary.AdminIds.filter(x => x == this.globalService.UserID).length > 0;
                
                this.loading = false;                
            },
            (err: HttpErrorResponse) => {
                console.log(err.message);
                this.loading = false;
            }
        );
    }
   
}
