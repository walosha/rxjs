import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
@Pipe({
  name: 'safe'
})
@Injectable({
  providedIn: 'root'
})
export class SafePipe implements PipeTransform {

  loader:any;

  constructor(protected _sanitizer: DomSanitizer) {
  }
  public transform(value: string, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        if(!value){
          return '';
        }
        var val = this._sanitizer.bypassSecurityTrustHtml(value.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' '));
        // console.log(value);
        // console.log(val);
        return val;
        // return this._sanitizer.bypassSecurityTrustHtml(val);
      case 'style':
        return this._sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this._sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        return this._sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl':
        return this._sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        throw new Error(`Unable to bypass security for invalid type: ${type}`);
    }
  }


}