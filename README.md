# Important Note

This is a personal project just for internal use at work (I used it to try out
`@angular/cli`'s `ng generate library`).

If you want more info on how to build an angular library with @angular/cli, take a look at this [great
article](https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11).

# MultiDatepicker

This is a directive to turn a text input into a simple time input. The improvement of this directive
over the default `<input type="time">` is the fact that the input will have the same looking accross
browsers. There's no graphical interface in this directive.

## Getting Started

`npm i @julianobrasil/timemask --save`

In the `@NgModule` where it will be used (usually `app.module.ts` for an application wide installation):

```ts
  import {JpTimeMaskModule} from '@julianobrasil/timemask';
  
  ...

  imports: [...,JpTimeMaskModule,...]
```

You can use it like this:

```html
<input JpTimeMaskModule [formControl]="inputCtrl">
```

Notice that the ngModel is mandatory, as this directive implements the ControlValueAccessor interface.

To see the possibilities, checkout this stackblitz demo: https://stackblitz.com/edit/angular-mulitdate-picker-demo

So you can mess with the code (it's not so hard)
