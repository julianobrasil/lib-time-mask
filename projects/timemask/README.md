[GitHub](https://github.com/julianobrasil/lib-time-mask) | [Stackblitz demo](https://stackblitz.com/edit/angular-timemask-demo)

# Important Note

This directive was built just for personal use (I used it mainly to try out a new `@angular/cli`
feature: `ng generate library`).

By 'personal' I mean there isn't any unit tests. So if you decide to use it, it's at your own risk.
Also, if you would like to contribute, go to [github repo](https://github.com/julianobrasil/lib-time-mask) and submit a PR.

If you want more info on how to build an angular library with `@angular/cli`, take a look at
[this great article](https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11).

# Input Time Mask

This is an `@angular` directive to turn a text input into a simple time input. The improvement of
this directive over the default `<input type="time">` is the fact that the input will have the same
looking accross browsers. There's no graphical interface: this is just a directive to impose a time
mask (HH:mm) on a regular html `<input>`.

## Getting Started

You can see a [demo at stackblitz](https://stackblitz.com/edit/angular-timemask-demo).

`npm i @julianobrasil/timemask --save`

In the `@NgModule` where it will be used (usually `app.module.ts` for an application wide
installation):

```ts
  import {JpTimeMaskModule} from '@julianobrasil/timemask';
  
  ...

  imports: [...,JpTimeMaskModule,...]
```

Currently it works with `Moment.js` only and you can use it with template-driven or reactive forms
like this:

```html
<input jpTimeMask [formControl]="inputCtrl">

<input jpTimeMask [(ngModel)]="value">
```

```ts
inputCtrl = new FormControl(moment());
value = moment();
```

## Value changes strategies

There are two value change strategies: eager and lazy. The lazy is the default one and it means
that the Control will register any change in its value just when the input loose focus or the user
press `ENTER`. In the eager mode, the input register changes as the user types in a new time. The
change strategy can be switched by the `jpTimeMaskChangeLazy` attribute:

```html
<!-- This sets the change strategy to eager --> 
<input jpTimeMask [jpTimeMaskChangeLazy]="false" [formControl]="inputCtrl">
```
## Known Caveats

This directive doesn't prevent/support the use of `value` attribute on the input.
