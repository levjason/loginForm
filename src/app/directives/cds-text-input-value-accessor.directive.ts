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
    this.onChange(v);
  };

  private blurHandler = () => this.onTouched();
  // Note: heavier autofocus/autofill probes have been intentionally removed
  // in this trimmed implementation. If you need robust autofill detection,
  // reintroduce startup/focus probes.

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

    // Note: startup/focus probes have been removed in this trimmed CVA.
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
      // focus listener removal removed in trimmed implementation
    } catch (e) {
      // ignore
    }
  }
}
