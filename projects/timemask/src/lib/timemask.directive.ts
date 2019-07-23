import {
  BACKSPACE,
  DELETE,
  ENTER,
  LEFT_ARROW,
  NINE,
  NUMPAD_NINE,
  NUMPAD_ZERO,
  RIGHT_ARROW,
  TAB,
  ZERO,
} from '@angular/cdk/keycodes';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  Self,
  forwardRef,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import * as moment_ from 'moment';
const moment = moment_;
export type Moment = moment_.Moment;

@Directive({
  selector: '[jpTimeMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JpTimeMaskDirective),
      multi: true,
    },
  ],
})
export class JpTimeMaskDirective implements OnInit,
    ControlValueAccessor {
  /** whether change the controle value upon blur/tab key press or while user
   * types the time */
  _jpTimeMaskChangeLazy = true;
  @Input()
  get jpTimeMaskChangeLazy(): boolean {
    return this._jpTimeMaskChangeLazy;
  }
  set jpTimeMaskChangeLazy(jpTimeMaskChangeLazy: boolean) {
    this._jpTimeMaskChangeLazy = jpTimeMaskChangeLazy !== false;
  }

  /** Whether to use utc with the moment objects */
  @Input()
  get useUtc(): boolean {
    return this._useUtc;
  }
  set useUtc(value: boolean) {
    this._useUtc = value;
    this._dateValue = value ?
                          moment.utc({
                            hour: 0,
                            minute: 0,
                            second: 0,
                            millisecond: 0,
                          }) :
                          moment({
                            hour: 0,
                            minute: 0,
                            second: 0,
                            millisecond: 0,
                          });
  }
  private _useUtc: boolean;

  /** implements ControlValueAccessorInterface */
  _onChange: (_: Moment) => void = () => {};

  /** implements ControlValueAccessorInterface */
  _touched: () => void = () => {};

  /** the moment value of the input */
  private _dateValue: Moment = moment({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  /** hether the input must behave as it has just gotten focused */
  private _fieldJustGotFocus = false;

  constructor(@Self() private _el: ElementRef, private _renderer: Renderer2) {}

  ngOnInit() {
    this._el.nativeElement.style.fontFamily = 'monospace';
    this._el.nativeElement.style.cursor = 'default';
    this._el.nativeElement.type = 'text';
    this._el.nativeElement.value = '--:--';
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    this._enforceInputLength();

    const keyCode = evt.keyCode;
    switch (keyCode) {
      case LEFT_ARROW:
      case RIGHT_ARROW:
        this._decideWhetherToJumpAndSelect(keyCode);
        break;

      case DELETE:
      case BACKSPACE:
        this._clearHoursOrMinutes();
        break;

      case ENTER:
        this._el.nativeElement.blur();
        break;

      default:
        if ((keyCode >= ZERO && keyCode <= NINE) ||
            (keyCode >= NUMPAD_ZERO && keyCode <= NUMPAD_NINE)) {
          this._setInputText(evt.key);
        }
    }
    if (keyCode !== TAB) {
      evt.preventDefault();
    }
  }

  /** when the input is clicked we must select the hours or the minutes */
  @HostListener('click', ['$event'])
  onClick(evt: MouseEvent) {
    this._enforceInputLength();

    this._fieldJustGotFocus = true;
    const caretPosition = this._doGetCaretPosition();
    if (caretPosition < 3) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
    }
  }

  /** when the input get focused (ex, by tab key) we must select the hours or
   * the minutes */
  @HostListener('focus', ['$event'])
  onFocus(evt: any) {
    this._enforceInputLength();

    this._fieldJustGotFocus = true;
    const caretPosition = this._doGetCaretPosition();
    if (caretPosition < 3) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
    }
  }

  /** when the input looses focus, notify the ControlValueAccessor interface */
  @HostListener('blur', ['$event'])
  onBlur(evt: any) {
    if (this.jpTimeMaskChangeLazy) {
      this._controlValueChanged();
    }
    this._touched();
  }

  /**
   * When the user press on the right/left keys, we have to move the selected
   * part of the input
   * accordingly (hours => minutes => hours)
   *
   * @param keyCode
   * @memberof JpTimeMaskDirective
   */
  private _decideWhetherToJumpAndSelect(keyCode: number) {
    switch (keyCode) {
      case RIGHT_ARROW:
        setTimeout(() => this._el.nativeElement.setSelectionRange(3, 6));
        break;

      case LEFT_ARROW:
        setTimeout(() => this._el.nativeElement.setSelectionRange(0, 2));
    }

    this._fieldJustGotFocus = true;
  }

  /**
   * change the hours or minutes parts, depending on where the caret is.
   *
   * @param key value (not code) of the key pressed
   * @memberof JpTimeMaskDirective
   */
  private _setInputText(key: string) {
    const input: string[] = this._el.nativeElement.value.split(':');

    const hours: string = input[0];
    const minutes: string = input[1];

    const caretPosition = this._doGetCaretPosition();
    if (caretPosition < 3) {
      this._setHours(hours, minutes, key);
    } else {
      this._setMinutes(hours, minutes, key);
    }

    this._fieldJustGotFocus = false;
  }

  /**
   * set the hours part of the mask when the user types in something and the
   * caret is at the
   * hours part
   *
   * @param hours the string representing the hours (2 digits)
   * @param minutes the string representing the minutes (2 digits)
   * @param key the value of the key that was pressed (just number keys)
   * @memberof JpTimeMaskDirective
   */
  private _setHours(hours: string, minutes: string, key: string) {
    const hoursArray: string[] = hours.split('');
    const firstDigit: string = hoursArray[0];
    const secondDigit: string = hoursArray[1];

    let newHour = '';

    let completeTime = '';
    let sendCaretToMinutes = false;

    if (firstDigit === '-' || this._fieldJustGotFocus) {
      newHour = `0${key}`;
      sendCaretToMinutes = Number(key) > 2;
    } else {
      newHour = `${secondDigit}${key}`;
      if (Number(newHour) > 23) {
        newHour = '23';
      }
      sendCaretToMinutes = true;
    }

    completeTime = `${newHour}:${minutes}`;

    this._renderer.setProperty(this._el.nativeElement, 'value', completeTime);
    if (!this.jpTimeMaskChangeLazy) {
      this._controlValueChanged();
    }
    if (!sendCaretToMinutes) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
      this._fieldJustGotFocus = true;
    }
  }

  /**
   * set the minutes part of the mask when the user types in something and the
   * caret is at the
   * minutes part
   *
   * @param hours the string representing the hours (2 digits)
   * @param minutes the string representing the minutes (2 digits)
   * @param key the value of the key that was pressed (just number keys)
   * @memberof JpTimeMaskDirective
   */
  private _setMinutes(hours: string, minutes: string, key: string) {
    const minutesArray: string[] = minutes.split('');
    const firstDigit: string = minutesArray[0];
    const secondDigit: string = minutesArray[1];

    let newMinutes = '';

    let completeTime = '';

    if (firstDigit === '-' || this._fieldJustGotFocus) {
      newMinutes = `0${key}`;
    } else {
      if (Number(minutes) === 59) {
        newMinutes = `0${key}`;
      } else {
        newMinutes = `${secondDigit}${key}`;
        if (Number(newMinutes) > 59) {
          newMinutes = '59';
        }
      }
    }

    completeTime = `${hours}:${newMinutes}`;

    this._renderer.setProperty(this._el.nativeElement, 'value', completeTime);
    if (!this.jpTimeMaskChangeLazy) {
      this._controlValueChanged();
    }
    this._el.nativeElement.setSelectionRange(3, 6);
  }

  /**
   * handle the delete or backspace keys events
   *
   * @memberof JpTimeMaskDirective
   */
  private _clearHoursOrMinutes() {
    const caretPosition = this._doGetCaretPosition();
    const input: string[] = this._el.nativeElement.value.split(':');

    const hours: string = input[0];
    const minutes: string = input[1];

    let newTime = '';
    let sendCaretToMinutes = false;

    if (caretPosition > 2) {
      newTime = `${hours}:--`;
      sendCaretToMinutes = true;
      this._dateValue.set({minute: 0, second: 0, millisecond: 0});
    } else {
      newTime = `--:${minutes}`;
      this._dateValue.set({hour: 0, second: 0, millisecond: 0});
      sendCaretToMinutes = false;
    }

    this._fieldJustGotFocus = true;

    this._renderer.setProperty(this._el.nativeElement, 'value', newTime);
    if (!this.jpTimeMaskChangeLazy) {
      this._controlValueChanged();
    }
    if (!sendCaretToMinutes) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
    }
  }

  /** Implementation for ControlValueAccessor interface */
  writeValue(value: Moment): void {
    this._dateValue = this.useUtc ? moment.utc(value) : moment(value);

    const v = value ? this._dateToStringTime(value) : '--:--';

    this._renderer.setProperty(this._el.nativeElement, 'value', v);
  }

  /** Implementation for ControlValueAccessor interface */
  registerOnChange(fn: (_: Moment) => void): void { this._onChange = fn; }

  /** Implementation for ControlValueAccessor interface */
  registerOnTouched(fn: () => void): void { this._touched = fn; }

  /** Implementation for ControlValueAccessor interface */
  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._el.nativeElement, 'disabled', isDisabled);
  }

  /*
  * Returns the caret position of the specified text field.
  * Return value range is 0-nativeElement.value.length.
  */

  /**
   * Returns the caret position of the specified text field.
   * Return value range is 0-nativeElement.value.length.
   *
   * @returns value range is 0-nativeElement.value.length.
   * @memberof JpTimeMaskDirective
   */
  private _doGetCaretPosition(): number {
    // Initialize
    let iCaretPos = 0;

    const nativeElement = this._el.nativeElement;

    // IE Support
    if (document.hasOwnProperty('selection')) {
      // Set focus on the element
      nativeElement.focus();

      // To get cursor position, get empty selection range
      const oSel = document['selection'].createRange();

      // Move selection start to 0 position
      oSel.moveStart('character', -nativeElement.value.length);

      // The caret position is selection length
      iCaretPos = oSel.text.length;
    } else if (nativeElement.selectionStart ||
               nativeElement.selectionStart === '0') {
      // Firefox support
      iCaretPos = nativeElement.selectionStart;
    }

    // Return results
    return iCaretPos;
  }

  /** build a time in 00:00 format */
  private _dateToStringTime(value: Moment) { return value.format('HH:mm'); }

  /** build a datetime in dd/MM/yyyy 00:00:00.000 format */
  private _dateToStringDateTime(value: Moment) {
    return value.format('dd/MM/yyyy HH:mm:ss.SSS');
  }

  /** Turns a string in format --, -X, X-, XY into a number, considering '-' =>
   * 0 */
  private _stringToNumber(str: string) {
    if (str.indexOf('-') === -1) {
      return Number(str);
    }

    const finalStr = str.replace('-', '0').replace('-', '0');

    return Number(finalStr);
  }

  /**
   * notify the ControlValueAccessor interface when the input date has changed.
   * In the lazy mode
   * this happens just when the ENTER key is pressed or when the component
   * looses focus.
   *
   * @memberof JpTimeMaskDirective
   */
  private _controlValueChanged() {
    const timeArray: string[] = this._el.nativeElement.value.split(':');

    let _oldValue: Moment =
        this._dateValue ? this._dateValue.clone() : undefined;

    if (!this._dateValue || !this._dateValue.isValid()) {
      this._dateValue = this.useUtc ? moment.utc() : moment();
    }

    this._dateValue =
        this.useUtc ?
            moment.utc(
                this._dateValue.hour(this._stringToNumber(timeArray[0]))) :
            moment(this._dateValue.hour(this._stringToNumber(timeArray[0])));

    this._dateValue =
        this.useUtc ?
            moment.utc(
                this._dateValue.minute(this._stringToNumber(timeArray[1]))) :
            moment(
                this._dateValue.minute(this._stringToNumber(timeArray[1])), );

    if (this._checkForChanges(_oldValue)) {
      this._onChange(this._dateValue);
    }
  }

  /**
   * verify whether the date/time changed
   *
   * @param oldValue
   * @returns true if the date/time value has changed
   * @memberof JpTimeMaskDirective
   */
  private _checkForChanges(oldValue: Moment): boolean {
    if ((!this._dateValue && !!oldValue) || (!!this._dateValue && !oldValue)) {
      return true;
    }

    if (!this._dateValue && !oldValue) {
      return false;
    }

    if ((!this._dateValue.isValid() && oldValue.isValid()) ||
        (this._dateValue.isValid() && !oldValue.isValid())) {
      return true;
    }

    if (this._dateToStringDateTime(this._dateValue) ===
        this._dateToStringDateTime(oldValue)) {
      return false;
    }

    return true;
  }

  /**
   * Make sure the input length is 5
   *
   * @memberof JpTimeMaskDirective
   */
  private _enforceInputLength() {
    // force max length to be 5
    if (this._el.nativeElement.maxLength != 5) {
      this._el.nativeElement.maxLength = 5;
    }

    // force min length to be 5
    if (this._el.nativeElement.minLength != 5) {
      this._el.nativeElement.minLength = 5;
    }
  }
}
