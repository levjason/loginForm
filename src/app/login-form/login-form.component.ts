import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputModule } from 'carbon-components-angular';
import { ButtonModule } from 'carbon-components-angular';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputModule, ButtonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  username = '';
  password = '';

  submit() {
    // Don't log raw passwords in real apps
    console.log('username:', this.username, 'passwordProvided:', !!this.password);
  }

  getPasswordInvalidText() {
    // Determine the appropriate invalid text based on validation errors
    // Template-driven controls expose `errors` on the ngModel; however,
    // we can't directly access the `passwordModel` here without ViewChild.
    // We'll return a generic message — the template still controls when
    // this message is shown via the `invalid` binding.
    return 'Password is invalid';
  }
}
