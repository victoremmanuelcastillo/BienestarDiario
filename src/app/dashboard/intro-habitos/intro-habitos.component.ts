// intro-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-habitos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-habitos.component.html',
  styleUrls: ['./intro-habitos.component.css']
})
export class IntroModalComponent {
  @Output() close = new EventEmitter<boolean>();
  dontShowAgain = false;

  toggleDontShowAgain(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.dontShowAgain = checkbox.checked;
  }

  closeModal(dontShowAgain: boolean): void {
    this.close.emit(this.dontShowAgain);
  }
}