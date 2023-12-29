import { Injectable } from '@angular/core';

@Injectable()
export class GlobalService {
    IsAdmin: boolean;
    CurrentIndex: number;
    UserID: string;
    UserName: string;
    constructor() {
        this.IsAdmin = localStorage.getItem('IsAdmin') == "true";
        this.CurrentIndex = 1;
        this.UserID = this.getCookie("UserID");
        this.UserName = this.getCookie("UserName");
    }

    public GetIsAdminAccount() {
        return localStorage.getItem('IsAdmin');
    }

    public SetIsAdminAccount(isAdmin) {
        this.IsAdmin = isAdmin;
        localStorage.setItem("IsAdmin", isAdmin);
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }

    createCookie(name, value, minutes) {
        if (minutes) {
            var date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            var expires = "; expires=" + date.toUTCString();
        } else {
            var expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }
}