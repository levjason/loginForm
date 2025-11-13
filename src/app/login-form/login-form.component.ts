import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
export class LoginFormComponent implements AfterViewInit, OnDestroy {
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

  // References to the underlying web components so we can detect
  // changes/autofill at the host level if needed.
  @ViewChild('usernameEl', { read: ElementRef, static: false }) usernameEl?: ElementRef<HTMLElement>;
  @ViewChild('passwordEl', { read: ElementRef, static: false }) passwordEl?: ElementRef<HTMLElement>;

  private _usernameListener = (e: Event) => {
    try {
      const host = this.usernameEl?.nativeElement as any;
      const v = host?.value ?? (e as any).detail?.value ?? host?.getAttribute?.('value') ?? '';
      try { console.debug('[LoginForm] username listener detected value=', v); } catch {}
      if (v !== this.username.value) this.username.setValue(v);
    } catch {
      // ignore
    }
  };

  private _passwordListener = (e: Event) => {
    try {
      const host = this.passwordEl?.nativeElement as any;
      const v = host?.value ?? (e as any).detail?.value ?? host?.getAttribute?.('value') ?? '';
      try { console.debug('[LoginForm] password listener detected value=', v ? '***' : '(empty)'); } catch {}
      if (v !== this.password.value) this.password.setValue(v);
    } catch {
      // ignore
    }
  };

  private _startupProbeTimer: any;

  submit() {
    // Don't log raw passwords in real apps
    const v = this.form.value;
    console.log('form value:', v);
  }

  ngAfterViewInit(): void {
    // Attach listeners to the underlying web components to capture value
    // changes that may not propagate via normal FormControl events (autofill, etc.)
    try {
      const usernameHost = this.usernameEl?.nativeElement;
      if (usernameHost) {
        usernameHost.addEventListener('input', this._usernameListener as EventListener);
        usernameHost.addEventListener('change', this._usernameListener as EventListener);
        usernameHost.addEventListener('value-changed', this._usernameListener as EventListener);
        usernameHost.addEventListener('focus', this._usernameListener as EventListener, true);
      }
    } catch {
      // ignore
    }

    try {
      const passwordHost = this.passwordEl?.nativeElement;
      if (passwordHost) {
        passwordHost.addEventListener('input', this._passwordListener as EventListener);
        passwordHost.addEventListener('change', this._passwordListener as EventListener);
        passwordHost.addEventListener('value-changed', this._passwordListener as EventListener);
        passwordHost.addEventListener('focus', this._passwordListener as EventListener, true);
      }
    } catch {
      // ignore
    }

    // Startup probe in case browser autofill populated values before listeners
    this._startupProbeTimer = setTimeout(() => {
      try {
        const host = this.usernameEl?.nativeElement as any;
        const v = host?.value ?? host?.getAttribute?.('value') ?? '';
        if (v && v !== this.username.value) this.username.setValue(v);
      } catch {
        // ignore
      }

      try {
        const host2 = this.passwordEl?.nativeElement as any;
        const v2 = host2?.value ?? host2?.getAttribute?.('value') ?? '';
        if (v2 && v2 !== this.password.value) this.password.setValue(v2);
      } catch {
        // ignore
      }
    }, 250);
  }

  ngOnDestroy(): void {
    // remove listeners and cleanup
    try {
      const usernameHost = this.usernameEl?.nativeElement;
      if (usernameHost) {
        usernameHost.removeEventListener('input', this._usernameListener as EventListener);
        usernameHost.removeEventListener('change', this._usernameListener as EventListener);
        usernameHost.removeEventListener('value-changed', this._usernameListener as EventListener);
        usernameHost.removeEventListener('focus', this._usernameListener as EventListener, true);
      }
    } catch {
      // ignore
    }

    try {
      const passwordHost = this.passwordEl?.nativeElement;
      if (passwordHost) {
        passwordHost.removeEventListener('input', this._passwordListener as EventListener);
        passwordHost.removeEventListener('change', this._passwordListener as EventListener);
        passwordHost.removeEventListener('value-changed', this._passwordListener as EventListener);
        passwordHost.removeEventListener('focus', this._passwordListener as EventListener, true);
      }
    } catch {
      // ignore
    }

    if (this._startupProbeTimer) {
      clearTimeout(this._startupProbeTimer);
      this._startupProbeTimer = undefined;
    }
  }

  /**
   * Helper to simulate browser autofill for testing.
   * It sets the host element's value and dispatches several events that
   * the ControlValueAccessor listens for so the reactive form updates.
   */
  simulateAutofill(username = 'alice@example.com', password = 'Password123') {
    try {
      const uhost = this.usernameEl?.nativeElement as any;
      if (uhost) {
        try { uhost.value = username; } catch {}
        try { uhost.setAttribute && uhost.setAttribute('value', username); } catch {}
        // dispatch events the accessor listens for
        try { uhost.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
        try { uhost.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        try { uhost.dispatchEvent(new CustomEvent('value-changed', { detail: { value: username }, bubbles: true })); } catch {}
      }
    } catch {
      // ignore
    }

    try {
      const phost = this.passwordEl?.nativeElement as any;
      if (phost) {
        try { phost.value = password; } catch {}
        try { phost.setAttribute && phost.setAttribute('value', password); } catch {}
        try { phost.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
        try { phost.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        try { phost.dispatchEvent(new CustomEvent('value-changed', { detail: { value: password }, bubbles: true })); } catch {}
      }
    } catch {
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

