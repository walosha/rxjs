import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatFormFieldModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonModule, 
//     MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, 
//     MatDividerModule, MatExpansionModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, 
//     MatMenuModule, MatNativeDateModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, 
//     MatRippleModule, MatSelectModule, MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule, 
//     MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule } from '@angular/material';
import { NgxCurrencyModule } from "ngx-currency";
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlickModule } from 'ngx-slick';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxGaugeModule } from 'ngx-gauge';
import { NgSelect2Module } from 'ng-select2';
import { NgApexchartsModule } from "ng-apexcharts";
import { SignaturePadModule } from 'angular2-signaturepad';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { HotelsComponent } from './hotels/hotels.component';
import { HotelDetailComponent } from './hotel-detail/hotels-detail.component';
import { VenuesComponent } from './venues/venues.component';
import { VenueDetailComponent } from './venue-detail/venue-detail.component';

import { EqualValidator } from './Directive/equal-validator';
import { OnlyNumber, OnlyDecimal, TwoDecimal } from './Directive/onlynumber.directive';

import { TimeFormat } from './pipe/convertFrom24To12Format';

import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { EventsComponent } from './events/events.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { AboutUsComponent } from './aboutus/aboutus.component';
import { PrivacyPolicyComponent } from './privacypolicy/privacypolicy.component';
import { TermsAndConditionsComponent } from './termsandconditions/termsandconditions.component';
import { ContactUsComponent } from './contactus/contactus.component';
import { BlogsComponent } from './blogs/blogs.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { MyProfileComponent } from './myprofile/myprofile.component';
import { EventRegisterComponent } from './eventregister/eventregister.component';
import { MyEventComponent } from './myevent/myevent.component';
import { AdminEventComponent } from './adminevent/adminevent.component';
import { EventComponent } from './event/event.component';
import { ProposalCartComponent } from './proposal-cart/proposal-cart.component';
import { ObligationComponent } from './obligation/obligation.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { IternaryComponent } from './iternary/iternary.component';

import { ApproveHotelComponent } from './approvehotel/approvehotel.component';
import { ApproveVenueComponent } from './approvevenue/approvevenue.component';

import { ProposalContractComponent } from './proposal-contract/proposal-contract.component';
import { ValidateDealComponent } from './validate-deal/validate-deal.component';
import { PaymentComponent, PaymentSuccessComponentDialog } from './payment/payment.component';

// services
import { AppService } from './services/app.service';
import { AuthenticationService } from './services/authentication.service';
import { GlobalService } from './services/global.service';

import 'hammerjs';
import { GaugesModule } from '@progress/kendo-angular-gauges';
import { ChartsModule } from '@progress/kendo-angular-charts';


import { PipesModule } from '../pipes/pipes.module';

import { MaterialModule } from '../material/material.module';
import { jqxKnobModule } from 'jqwidgets-ng/jqxknob'

import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
// import { FlexLayoutModule } from '@angular/flex-layout';


export const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: true,
    allowZero: true,
    decimal: ".",
    precision: 2,
    prefix: "$ ",
    suffix: "",
    thousands: ",",
    nullable: true
};

@NgModule({
    declarations: [
        AppComponent,
        HotelsComponent,
        HotelDetailComponent, 
        VenuesComponent,  
        VenueDetailComponent,     
        HeaderComponent,
        FooterComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        EventsComponent,
        ConfirmComponent,        
        PaymentSuccessComponentDialog,
        AboutUsComponent,
        PrivacyPolicyComponent,
        TermsAndConditionsComponent,
        ContactUsComponent,
        BlogsComponent,
        BlogDetailComponent,
        MyProfileComponent,
        EventRegisterComponent,
        MyEventComponent, 
        AdminEventComponent,
        EventComponent,
        ProposalCartComponent,
        ObligationComponent,
        NotificationsComponent,
        ProposalContractComponent,
        ValidateDealComponent,
        PaymentComponent,
        IternaryComponent,
        ApproveHotelComponent,
        ApproveVenueComponent,
        EqualValidator,
        OnlyNumber,
        OnlyDecimal,
        TwoDecimal,
        TimeFormat
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NgApexchartsModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        jqxKnobModule,
        // MatAutocompleteModule,
        // MatBadgeModule,
        // MatBottomSheetModule,
        // MatButtonModule,
        // MatButtonToggleModule,
        // MatCardModule,
        // MatCheckboxModule,
        // MatChipsModule,
        // MatStepperModule,
        // MatDatepickerModule,
        // MatDialogModule,
        // MatDividerModule,
        // MatExpansionModule,
        // MatGridListModule,
        // MatIconModule,
        // MatInputModule,
        // MatListModule,
        // MatMenuModule,
        // MatNativeDateModule,
        // MatPaginatorModule,
        // MatProgressBarModule,
        // MatProgressSpinnerModule,
        // MatRadioModule,
        // MatRippleModule,
        // MatSelectModule,
        // MatSidenavModule,
        // MatSliderModule,
        // MatSlideToggleModule,
        // MatSnackBarModule,
        // MatSortModule,
        // MatTableModule,
        // MatTabsModule,
        // MatToolbarModule,
        // MatTooltipModule,
        // MatTreeModule,
        // FlexLayoutModule,
        MaterialModule,
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        SlickModule.forRoot(),
        MDBBootstrapModule.forRoot(),
        ToastrModule.forRoot(),
        TextMaskModule,
        NgxFileDropModule,
        NgxGaugeModule,
        GaugesModule,
        ChartsModule,
        NgSelect2Module,
        PipesModule,
        GalleryModule,
        LightboxModule,
        SignaturePadModule
    ],
    providers: [AppService, AuthenticationService, GlobalService],
    bootstrap: [AppComponent],
    entryComponents: [PaymentSuccessComponentDialog]
})
export class AppModule { }
