import { CurrencyIndex } from '@angular/common/src/i18n/locale_data';

export class HotelInterface {
    ID: number;
    HotelName: string;
    Address: string;
    Description: string;
    PricePerNight: string;
    Price: number;
    PhoneNumber: string;
    Website: string;
    Chain: string;
    Brand: string;
    CostPerCouple: string;
    ListImage: string;
    NoOfReviews: number;
    HotelStar: number;
    ReviewStar: number;
    MinCapacity: number;
    MaxCapacity: number;
    Latitude: number;
    Longitude: number;
    Distance: number;
    StartDate: string;
    StartTime: string;
    EndDate: string;
    EndTime: string;
    ProductID: number;
    Available: string;
    PriceRating: string;
    PlaceID: string;
    SliderImages: Image[];
    PrimaryImage: Image;
    included: string[];
    DescriptionList: Attribute[];
    Facilities: Facility[];
    Reviews: Review[];
    Notes: ExportProductContent[];
    Selected: boolean;
}

export interface Facility {
    FacilityID: number,
    FacilityName: string
}

export interface IHotelList {
    data: IHotel[];
}

export interface IHotel {
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
    style: IKeyDescription;
    startDate: string;
    endDate: string;
    duration: string;
    facilityRating: string;
    _description: string;
}

export class IExploreDiscovery {
    data: ExploreDiscovery;
}

export class ExploreDiscovery {
    facility: IKeyDescription;
    type: IKeyDescription;
    address: Address;
    geoCode: string;
    region: IKeyDescription;
    included: string[];
    content: Image[];
    primaryImage: Image;
    fromPrice: IPrice;
    regularPrice: IPrice;
    pricedPer: string;
    _description: string;
}

export class IExploreProduct {
    data: ExploreProduct;
}

export class ExploreProduct {
    type: IKeyDescription;
    facility: IKeyDescription;
    product: IKeyDescription;
    style: IKeyDescription;
    brand: IKeyDescription;
    facilityChain: IKeyDescription;
    productGroups: IKeyDescription[];
    facilityRating: string;
    region: IKeyDescription;
    address: Address;
    geocode: string;
    phone: string;
    website: string;
    commenceTime: string;
    completesTime: string;
    minDuration: number;
    maxDuration: number;
    granularity: string;
    baseOccupancy: number;
    minOccupancy: number;
    maxOccupancy: number;
    maxAdults: number;
    maxChildren: number;
    maxChildAge: number;
    beds: number;
    bedrooms: number;
    bathrooms: number;
    fromPrice: IPrice;
    pricedPer: string;
    rewardsEarned: boolean;
    rewardsRedeemable: boolean;
    attributes: Attribute[];
    _domain: string;
}

export class IExportProductContent {
    data: ExportProductContent[];
}

export class ExportProductContent {
    priority: number;
    title: string;
    mt: string;
    body: string;
    language: string;
    _id: string;
}

export class Image {
    priority: number;
    title: string;
    url: string;
    caption: string;
    mt: string;
}

export class Address {
    street1: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    _id: number;
}

export interface IKeyDescription {
    key: number;
    description: string;
}

export interface IPrice {
    currency: string;
    amount: number;
}

export class Attribute {
    attribute: IKeyDescription;
}

export class GoogleAPIResponse {
    html_attributions: string[];
    result: GoogleAPIResult;
    status: string;
}

export class GoogleAPIResult {
    address_components: AddressComponent[];
    adr_address: string;
    business_status: string;
    formatted_address: string;
    formatted_phone_number: string;
    icon: string;
    international_phone_number: string;
    name: string;
    place_id: string;
    rating: number;
    reference: string;
    reviews: Review[];
    url: string;
    user_ratings_total: number;
    utc_offset: number;
    vicinity: string;
    website: string;
}

export class AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

export class Review {
    author_name: string;
    author_url: string;
    language: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
}

export class GooglePlaceAPIResponse {
    destination_addresses: string[];
    origin_addresses: string[];
    rows: Row[];
    status: string;
}

export class Row {
    elements: PlaceElement[];
}

export class PlaceElement {
    distance: Distance;
    duration: Duration;
    status: string;
}

export class Distance {
    text: string;
    value: number;
}

export class Duration {
    text: string;
    value: number;
}