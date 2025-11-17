import { Directive, ElementRef, forwardRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  // Apply this accessor to both text and password Carbon web components
  // note: the password web component is `cds-password-input` in the template
  selector: 'cds-text-input,cds-password-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CdsTextInputValueAccessorDirective),
      multi: true,
    },
  ],
})
export class CdsTextInputValueAccessorDirective implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  // timer for the startup probe
  private _startupProbeTimer: any;
  // last emitted value to avoid duplicate change notifications
  private _lastEmittedValue: any = undefined;

  // events we listen to for value changes. Some web components emit `input`,
  // Only listen for the native `input` event and Carbon's `value-changed` custom event.
  // This keeps the directive lightweight while still catching programmatic updates
  // that the web components emit using `value-changed`.
  private valueEvents = ['input', 'value-changed'];

  private inputHandler = (e: Event) => {
    const host = this.el.nativeElement as any;
    // Try common locations for the new value
    // Prefer the host's `value` property; if the custom event provides a detail
    // payload use that. As a lightweight fallback, read the `value` attribute.
    let v = host?.value;
    if ((e as any).detail && (e as any).detail.value !== undefined) {
      v = (e as any).detail.value;
    }
    if (v === undefined && host && host.getAttribute) {
      v = host.getAttribute('value');
    }
    if (v === undefined || v === null) v = '';

    try { console.debug('[CVA] value-change detected on', this.el.nativeElement?.tagName, 'value=', v, 'event=', e.type); } catch {}
    this.emitIfChanged(v);
  };

  private blurHandler = () => this.onTouched();
  // Focus probe: on focus, schedule a short re-check. Some browsers perform
  // autofill on focus and may not emit host-level events; the focus probe
  // catches that case with a single delayed check.
  private focusProbeHandler = () => {
    setTimeout(() => {
      try {
        const host = this.el.nativeElement as any;
        const v = host?.value ?? (host.getAttribute ? host.getAttribute('value') : undefined) ?? '';
        if (v) {
          try { console.debug('[CVA] focus probe detected value on', this.el.nativeElement?.tagName, v); } catch {}
          this.onChange(v);
        }
      } catch (e) {
        // ignore
      }
    }, 200);
  };

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Attach listeners for common value-change events and blur
    for (const ev of this.valueEvents) {
      try {
        this.el.nativeElement.addEventListener(ev, this.inputHandler as EventListener);
      } catch (e) {
        // ignore if event can't be attached
      }
    }
    try {
      this.el.nativeElement.addEventListener('blur', this.blurHandler as EventListener);
    } catch (e) {
      // ignore
    }
    try {
      // capture phase so focus inside the shadow DOM is caught
      this.el.nativeElement.addEventListener('focus', this.focusProbeHandler as EventListener, true);
    } catch (e) {
      // ignore
    }

    // Single startup probe: check the host value once after a short delay to
    // catch browser autofill that populated the inner input before events
    // propagated. This is intentionally conservative (one probe only).
    this._startupProbeTimer = setTimeout(() => {
      try {
        const host = this.el.nativeElement as any;
        const v = host?.value ?? (host.getAttribute ? host.getAttribute('value') : undefined) ?? '';
        if (v) {
          try { console.debug('[CVA] startup probe detected value on', this.el.nativeElement?.tagName, v); } catch {}
          this.emitIfChanged(v);
        }
      } catch (e) {
        // ignore
      }
    }, 250);
  }

  writeValue(obj: any): void {
    try {
      const host = this.el.nativeElement as any;
      // Prefer setting the `value` property; fall back to attribute if not available
      if (host && 'value' in host) {
        host.value = obj ?? '';
      } else if (host && host.setAttribute) {
        host.setAttribute('value', obj ?? '');
      }
    } catch (e) {
      // ignore
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    try {
      const host = this.el.nativeElement as any;
      if ('disabled' in host) {
        host.disabled = isDisabled;
      } else if (host && host.setAttribute) {
        if (isDisabled) host.setAttribute('disabled', '');
        else host.removeAttribute('disabled');
      }
    } catch (e) {
      // ignore
    }
  }

  ngOnDestroy(): void {
    try {
      for (const ev of this.valueEvents) {
        try {
          this.el.nativeElement.removeEventListener(ev, this.inputHandler as EventListener);
        } catch (e) {
          // ignore
        }
      }
      try {
        this.el.nativeElement.removeEventListener('blur', this.blurHandler as EventListener);
      } catch (e) {
        // ignore
      }
      try {
        this.el.nativeElement.removeEventListener('focus', this.focusProbeHandler as EventListener, true);
      } catch (e) {
        // ignore
      }
      // clear startup probe timer if set
      if (this._startupProbeTimer) {
        try { clearTimeout(this._startupProbeTimer); } catch (e) { /* ignore */ }
        this._startupProbeTimer = undefined;
      }
    } catch (e) {
      // ignore
    }
  }

  // Emit change only when value differs from last emitted value
  private emitIfChanged(v: any) {
    if (v === undefined || v === null) v = '';
    if (this._lastEmittedValue !== v) {
      this._lastEmittedValue = v;
      try { this.onChange(v); } catch (e) { /* ignore */ }
    }
  }
}
