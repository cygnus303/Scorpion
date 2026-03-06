import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appSort]',
  standalone: false
})
export class SortDirective {

 @Input() column: string = '';
  @Output() sort = new EventEmitter<{column:string, direction:string}>();

  direction: 'asc' | 'desc' = 'asc';

@HostListener('click')
onClick() {

  this.sort.emit({
    column: this.column,
    direction: this.direction
  });

  this.direction = this.direction === 'asc' ? 'desc' : 'asc';

}

}
