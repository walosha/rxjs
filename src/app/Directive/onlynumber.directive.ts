
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[OnlyNumber]'
})
export class OnlyNumber {

    constructor(private el: ElementRef) { }

    @Input() OnlyNumber: boolean;

    @HostListener('keydown', ['$event']) onKeyDown(event) {
        let e = <KeyboardEvent>event;
        if (this.OnlyNumber) {
            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
                (e.keyCode == 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
                (e.keyCode == 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }
    }
}

@Directive({
    selector: '[OnlyDecimal]'
})
export class OnlyDecimal {

    constructor(private el: ElementRef) { }

    @Input() OnlyDecimal: boolean;

    @HostListener('keydown', ['$event']) onKeyDown(event) {
        let e = <KeyboardEvent>event;
        if (this.OnlyDecimal) {
            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
                (e.keyCode == 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
                (e.keyCode == 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            var value = this.el.nativeElement.value;
            if (!((e.keyCode != 190 || value.indexOf('.') != -1) && (e.keyCode != 110 || value.indexOf('.') != -1)))
                return;
            else if (value.indexOf('.') != -1 && value.length >= value.indexOf('.') + 5)
                e.preventDefault();
            else {
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            }
        }
    }
}

@Directive({
    selector: '[TwoDecimal]'
})
export class TwoDecimal {

    constructor(private el: ElementRef) { }

    @Input() TwoDecimal: boolean;

    @HostListener('keydown', ['$event']) onKeyDown(event) {
        let e = <KeyboardEvent>event;
        if (this.TwoDecimal) {
            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
                (e.keyCode == 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
                (e.keyCode == 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            var value = this.el.nativeElement.value;
            if (!((e.keyCode != 190 || value.indexOf('.') != -1) && (e.keyCode != 110 || value.indexOf('.') != -1)))
                return;
            else if (value.indexOf('.') != -1 && value.length >= value.indexOf('.') + 3)
                e.preventDefault();
            else {
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            }
        }
    }
}