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

  // events we listen to for value changes. Some web components emit `input`,
  // `change`, or a custom `value-changed`/`valueChange` event with detail payload —
  // listen to the common ones and extract value robustly.
  private valueEvents = ['input', 'change', 'value-changed', 'valueChange'];

  private inputHandler = (e: Event) => {
    const host = this.el.nativeElement as any;
    // Try common locations for the new value
    let v: any = undefined;
    try {
      v = host.value;
    } catch (err) {
      // ignore
    }
    // If the event carries the new value in detail, prefer that
    if (v === undefined && (e as any).detail && (e as any).detail.value !== undefined) {
      v = (e as any).detail.value;
    }
    // Fallback to attribute
    if (v === undefined && host.getAttribute) {
      v = host.getAttribute('value');
    }
    // Normalize undefined -> '' for form control
    if (v === undefined) v = '';

    try { console.debug('[CVA] value-change detected on', this.el.nativeElement?.tagName, 'value=', v, 'event=', e.type); } catch {}
    this.onChange(v);
  };

  private blurHandler = () => this.onTouched();
  // probe handlers for autofill detection
  private focusProbeHandler = () => {
    // schedule a short re-check after focus (some browsers autofill on focus)
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

    // Startup probe: check current value after a short delay in case the browser autofilled
    setTimeout(() => {
      try {
        const host = this.el.nativeElement as any;
        const v = host?.value ?? (host.getAttribute ? host.getAttribute('value') : undefined) ?? '';
        if (v) {
          try { console.debug('[CVA] startup probe detected value on', this.el.nativeElement?.tagName, v); } catch {}
          this.onChange(v);
        }
      } catch (e) {
        // ignore
      }
    }, 250);

    // Listen for focus to detect autofill performed on focus
    try {
      this.el.nativeElement.addEventListener('focus', this.focusProbeHandler as EventListener, true);
    } catch (e) {
      // ignore
    }
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
    } catch (e) {
      // ignore
    }
  }
}
