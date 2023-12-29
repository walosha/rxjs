import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HotelsComponent } from "./hotels/hotels.component";
import { HotelDetailComponent } from "./hotel-detail/hotels-detail.component";
import { VenuesComponent } from "./venues/venues.component";
import { VenueDetailComponent } from "./venue-detail/venue-detail.component";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { EventsComponent } from "./events/events.component";
import { ConfirmComponent } from "./confirm/confirm.component";
import { AboutUsComponent } from "./aboutus/aboutus.component";
import { PrivacyPolicyComponent } from "./privacypolicy/privacypolicy.component";
import { TermsAndConditionsComponent } from "./termsandconditions/termsandconditions.component";
import { ContactUsComponent } from "./contactus/contactus.component";
import { BlogsComponent } from "./blogs/blogs.component";
import { BlogDetailComponent } from "./blog-detail/blog-detail.component";
import { MyProfileComponent } from "./myprofile/myprofile.component";
import { EventRegisterComponent } from "./eventregister/eventregister.component";
import { MyEventComponent } from "./myevent/myevent.component";
import { AdminEventComponent } from "./adminevent/adminevent.component";
import { EventComponent } from "./event/event.component";
import { ProposalCartComponent } from "./proposal-cart/proposal-cart.component";
import { ObligationComponent } from "./obligation/obligation.component";
import { NotificationsComponent } from "./notifications/notifications.component";

import { ProposalContractComponent } from "./proposal-contract/proposal-contract.component";
import { ValidateDealComponent } from "./validate-deal/validate-deal.component";
import { PaymentComponent } from "./payment/payment.component";
import { IternaryComponent } from "./iternary/iternary.component";
import { ApproveHotelComponent } from "./approvehotel/approvehotel.component";
import { ApproveVenueComponent } from "./approvevenue/approvevenue.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "hotels",
    component: HotelsComponent,
  },
  {
    path: "hotel-detail",
    component: HotelDetailComponent,
  },
  {
    path: "venues",
    component: VenuesComponent,
  },
  {
    path: "venue-detail",
    component: VenueDetailComponent,
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "events",
    component: EventsComponent,
  },
  {
    path: "confirm",
    component: ConfirmComponent,
  },
  {
    path: "about-us",
    component: AboutUsComponent,
  },
  {
    path: "privacy-policy",
    component: PrivacyPolicyComponent,
  },
  {
    path: "terms-and-conditions",
    component: TermsAndConditionsComponent,
  },
  {
    path: "contact-us",
    component: ContactUsComponent,
  },
  {
    path: "blog",
    component: BlogsComponent,
  },
  {
    path: "blog-detail",
    component: BlogDetailComponent,
  },
  {
    path: "myprofile",
    component: MyProfileComponent,
  },
  {
    path: "eventregister",
    component: EventRegisterComponent,
  },
  {
    path: "myevent",
    component: MyEventComponent,
  },
  {
    path: "adminevent",
    component: AdminEventComponent,
  },
  {
    path: "notifications",
    component: NotificationsComponent,
  },
  {
    path: "event",
    component: EventComponent,
  },
  {
    path: "proposal-cart",
    component: ProposalCartComponent,
  },
  {
    path: "deal/:DealID/:Type",
    component: ValidateDealComponent,
  },
  {
    path: "payment",
    component: PaymentComponent,
  },
  {
    path: "obligation",
    component: ObligationComponent,
  },
  {
    path: "proposal-contract",
    component: ProposalContractComponent,
  },
  {
    path: "iternary/:ProposalID",
    component: IternaryComponent,
    data: { showHeader: false, showSidebar: false },
  },
  {
    path: "approve-hotel/:ProposalID",
    component: ApproveHotelComponent,
  },
  {
    path: "approve-venue/:ProposalID",
    component: ApproveVenueComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
