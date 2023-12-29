export class HotelFilterModel {
    public hotelName: string;
    public rating1: boolean;
    public rating2: boolean;
    public rating3: boolean;
    public rating4: boolean;
    public rating5: boolean;
    public price1: boolean;
    public price2: boolean;
    public price3: boolean;
    public price4: boolean;
    public price5: boolean;
    public fromDate: any;
    public toDate: any;

    constructor() {
        this.hotelName = "";
        this.rating1 = this.rating2 = this.rating3 = this.rating4 = this.rating5 = false;
        this.price1 = this.price2 = this.price3 = this.price4 = this.price5 = false;
        this.fromDate = "";
        this.toDate = "";
    };
};