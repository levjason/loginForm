import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { InputModule } from 'carbon-components-angular';
import { ButtonModule } from 'carbon-components-angular';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/password-input/index.js';
import { CdsTextInputValueAccessorDirective } from '../directives/cds-text-input-value-accessor.directive';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputModule, ButtonModule, CdsTextInputValueAccessorDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  // Reactive form group
  form: UntypedFormGroup = new UntypedFormGroup({
    username: new UntypedFormControl('', Validators.required),
    password: new UntypedFormControl('', Validators.required),
    textin: new UntypedFormControl(''),
  });

  // Convenience getters for template access
  get username() {
    return this.form.get('username') as UntypedFormControl;
  }

  get password() {
    return this.form.get('password') as UntypedFormControl;
  }

  get textin() {
    return this.form.get('textin') as UntypedFormControl;
  }

  // Component-level probes/listeners removed. Value syncing is handled by the CVA directive.

  submit() {
    // Don't log raw passwords in real apps
    const v = this.form.value;
    console.log('form value:', v);
  }

  // No lifecycle probes here — the directive handles element-level probes.

  /**
   * Helper to simulate browser autofill for testing.
   * It sets the host element's value and dispatches several events that
   * the ControlValueAccessor listens for so the reactive form updates.
   */
  simulateAutofill(username = 'alice@example.com', password = 'Password123') {
    // For testing in this simplified flow, set the form controls directly.
    try {
      this.username.setValue(username);
      this.username.markAsDirty();
      this.username.markAsTouched();
    } catch (e) {
      // ignore
    }

    try {
      this.password.setValue(password);
      this.password.markAsDirty();
      this.password.markAsTouched();
    } catch (e) {
      // ignore
    }
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

