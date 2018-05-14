import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { JpTimeMaskDirective } from './timemask.directive';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [JpTimeMaskDirective],
  exports: [JpTimeMaskDirective],
})
export class JpTimeMaskModule {}
