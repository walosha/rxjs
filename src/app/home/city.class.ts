export class City {
    constructor(public id: number, public name: string) { }
}

export interface ICityResponse {
    total: number;
    results: City[];
}

export interface IUniversityResponse {
    total: number;
    results: IUniversityItemResponse[];
}

export class IUniversityItemResponse {
    constructor(public id: string, public text: string) { }
}

export interface IDestinations {
    data: DestinationItem[];
    results: IUniversityItemResponse[];
}

export class DestinationItem {
    constructor(public key: number, public description: string, public _domain: string) { }
}