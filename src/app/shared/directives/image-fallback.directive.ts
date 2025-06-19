import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[fallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() fallback: string;

  constructor(private eRef: ElementRef) { }

  @HostListener('error')
  loadFallbackOnError() {
    const element: HTMLImageElement = this.eRef.nativeElement;
    element.src = this.fallback || 'assets/images/default.jpg';
  }
}