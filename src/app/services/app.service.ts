import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { City, ICityResponse, IDestinations, DestinationItem, IUniversityItemResponse } from '../home/city.class';
import { environment } from './../../environments/environment';

@Injectable()
export class AppService {    
    private baseUrl: string;
    constructor(private http: HttpClient) {
        this.baseUrl = environment.rezometryApiUrl;        
    }

    private configUrl = 'assets/json/events.json';

    Get(url: string) {        
        return this.http.get(environment.apiUrl + url);
    }

    GetMap(url: string) {
        return this.http.get(environment.apiUrl + url);
    }

    Post(url: string, model: any) {
        return this.http.post(environment.apiUrl + url, model);
    }

    private setToken() {
        return { headers: new HttpHeaders({ 'Authorization': 'Basic d2Vic2l0ZTp3ZWJzaXRlOTc4Ng==', 'Content-Type': 'application/json' }) };
    }

    private setJsonP() {
        return { headers: new HttpHeaders({ 'data-type': 'jsonp' }) };
    }

    getEvent() {
        return this.http.get(this.configUrl);
    }

    getUniversities() {
        return this.http.get('assets/json/universities.json');
    }

    sendApprovedEmail(eventName: string) {
        return this.http.get('https://tst.cybercloudspostoffice.com/api/email/SendApprovedEmail?eventName=' + eventName + "&url=" + window.location.origin + "&email=team.fbdemo1@gmail.com");
    }

    sendInvitationEmail(eventName: string) {
        return this.http.get('https://tst.cybercloudspostoffice.com/api/email/SendInvitationEmail?eventName=' + eventName + "&url=" + window.location.origin + "&email=team.fbdemo1@gmail.com");
    }

    /// Destination search
    search(filter: { name: string } = { name: '' }, page = 1): Observable<IDestinations> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get<IDestinations>('assets/json/cities.json')
            .pipe(
                tap((response: IDestinations) => {
                    response.results = response.data.map(city => new IUniversityItemResponse(city.key.toString(), city.description))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }

    GetData(filter: { name: string } = { name: '' }): Observable<IDestinations> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get<IDestinations>('assets/json/cities.json')
        .pipe(
            tap((response: IDestinations) => {
                response.results = response.data.map(city => new IUniversityItemResponse(city.key.toString(), city.description))
                    .filter(user => user.text.toLowerCase().includes(filter.name))

                return response;
            })
        );
    }

    /// Destination search
    searchDestination(filter: { url: string, name: string } = { url: '', name: '' }, page = 1): Observable<IDestinations> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get<IDestinations>(environment.apiUrl + filter.url)
            .pipe(
                tap((response: IDestinations) => {
                    response.data = response.data.map(hotel => new DestinationItem(hotel.key, hotel.description, hotel._domain))
                        // Not filtering in the server since in-memory-web-api has somewhat restricted api
                        .filter(user => user.description.toLowerCase().includes(filter.name))
                    response.results = response.data.map(city => new IUniversityItemResponse(city.key.toString(), city.description))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }

    /// University search
    searchUniversity(filter: { url: string, name: string } = { url: '', name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get<any>(environment.apiUrl + filter.url)
        .pipe(
            tap((response: any) => {
                response.results = response.data.map(city => new IUniversityItemResponse(city.key.toString(), city.description))
                    .filter(user => user.text.toLowerCase().includes(filter.name))
                return response;
            })
        );
    }

    /// Organization search
    searchOrganization(filter: { url: string, name: string } = { url: '', name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get<any>(environment.apiUrl + filter.url)
        .pipe(
            tap((response: any) => {
                response.results = response.data.map(city => new IUniversityItemResponse(city.key.toString(), city.description))
                    .filter(user => user.text.toLowerCase().includes(filter.name))

                return response;
            })
        );
    }

    /// Chapter search
    searchChapter(filter: { name: string } = { name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get('assets/json/universities.json')
            .pipe(
                tap((response: any) => {
                    response.results = response.Chapters.map(city => new IUniversityItemResponse(city.id, city.name))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }

    /// Chapter 2 search
    searchChapter2(filter: { name: string } = { name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get('assets/json/universities.json')
            .pipe(
                tap((response: any) => {
                    response.results = response.Chapters.map(city => new IUniversityItemResponse(city.id, city.name))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }

    /// Chapter search
    searchChapterContributions(filter: { name: string } = { name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get('assets/json/universities.json')
            .pipe(
                tap((response: any) => {
                    response.results = response.ChapterContributions.map(city => new IUniversityItemResponse(city.id, city.name))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }

    /// Chapter search
    searchSeason(filter: { name: string } = { name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get('assets/json/universities.json')
            .pipe(
                tap((response: any) => {
                    response.results = response.Seasons.map(city => new IUniversityItemResponse(city.id, city.name))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }

    /// Chapter search
    searchYear(filter: { name: string } = { name: '' }, page = 1): Observable<ICityResponse> {
        if (filter != null && filter.name != '' && filter.name && typeof (filter.name) == "string") {
            filter.name = filter.name.toLowerCase();
        }
        return this.http.get('assets/json/universities.json')
            .pipe(
                tap((response: any) => {
                    response.results = response.Years.map(city => new IUniversityItemResponse(city.id, city.name))
                        .filter(user => user.text.toLowerCase().includes(filter.name))

                    return response;
                })
            );
    }
}