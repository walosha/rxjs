import { Address, Image, Attribute,Facility, Review, IKeyDescription, IPrice, ExportProductContent } from '../hotels/hotel.class';

export class VenueInterface {
    ID: number;
    VenueName: string;
    Address: string;
    FoodCaption: string;
    Description: string;
    Duration: string;
    PricePerNight: string;
    Price: number;
    CostPerCouple: string;
    ListImage: string;
    NoOfReviews: number;
    VenueStar: number;
    ReviewStar: number;
    MinCapacity: number;
    MaxCapacity: number;
    Latitude: number;
    Longitude: number;
    Distance: number;
    StartDate: string;
    EndDate: string;
    ProductID: number;
    Available: string;
    PriceRating: string;
    PlaceID: string;
    SliderImages: Image[];
    PrimaryImage: Image;
    included: string[];
    DescriptionList: Attribute[];
    FoodOptions: FoodOptionViewModel[];
    Facilities: Facility[];
    Reviews: Review[];
    DistanceToHotel: string;
    Driving: string;
    Walking: string;
    WhatsIncluded: string;
    Notes: ExportProductContent[];
    Selected: boolean;
}

export interface IVenueList {
    data: IVenue[];
}

export interface IVenue {
    shopper: IKeyDescription,
    preferredCurrency: string;
    facility: IKeyDescription;
    city: string;
    vendorPreferred: boolean;
    nights: number;
    available: string;
    reserving: string;
    unitsRequested: number;
    unitCount: number;
    program: IKeyDescription;
    pricedAs: string;
    priceEach: IPrice;
    totalPrice: IPrice;
    totalTaxes: IPrice;
    travellerCount: number;
    travellerPrice: IPrice;
    unitPrice: IPrice;
    assignable: true;
    appliedDiscounts: [];
    travelDomain: string;
    product: IKeyDescription;
    unit: IKeyDescription;
    startDate: string;
    endDate: string;
    duration: string;
    _description: string;
}

export class FoodOptionViewModel {
    component: IKeyDescription;
    product: IKeyDescription;
    description: string;
    duration: string;
}