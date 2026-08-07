"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { createPortal } from "react-dom";
import PhoneInputBase, {
  getCountryCallingCode,
  type Country,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { cn } from "@/lib/cn";

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

type CountrySelectProps = {
  value?: Country;
  onChange: (country: Country) => void;
  options: Array<{ value?: Country; label: string }>;
  disabled?: boolean;
};

/**
 * Country dropdown with flag + dial code, portaled above modals.
 */
function CountrySelect({
  value,
  onChange,
  options,
  disabled,
}: CountrySelectProps) {
  const selected = value || "US";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 300,
    openUp: false,
  });

  const countries = useMemo(
    () =>
      options.filter(
        (entry): entry is { value: Country; label: string } =>
          Boolean(entry.value),
      ),
    [options],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((entry) => {
      const dial = getCountryCallingCode(entry.value);
      return (
        entry.label.toLowerCase().includes(q) ||
        entry.value.toLowerCase().includes(q) ||
        `+${dial}`.includes(q) ||
        dial.includes(q)
      );
    });
  }, [countries, query]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(300, Math.min(360, window.innerWidth - 24));
      const left = Math.min(rect.left, window.innerWidth - width - 12);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 280 && rect.top > spaceBelow;
      setCoords({
        top: openUp ? rect.top - 6 : rect.bottom + 6,
        left: Math.max(12, left),
        width,
        openUp,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const Flag = flags[selected];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="vm-phone-cc"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Country code"
        onClick={() => {
          setQuery("");
          setOpen((prev) => !prev);
        }}
      >
        <span className="vm-phone-flag">
          {Flag ? <Flag title={selected} /> : null}
        </span>
        <span className="vm-phone-dial">
          +{getCountryCallingCode(selected)}
        </span>
        <span className="vm-phone-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="vm-phone-menu"
              role="listbox"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                transform: coords.openUp ? "translateY(-100%)" : undefined,
              }}
            >
              <input
                type="search"
                className="vm-phone-search"
                placeholder="Search country"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
              />
              <div className="vm-phone-options">
                {filtered.length === 0 ? (
                  <div className="vm-phone-empty">No country found</div>
                ) : (
                  filtered.map((entry) => {
                    const OptionFlag = flags[entry.value];
                    const dial = getCountryCallingCode(entry.value);
                    const active = entry.value === selected;
                    return (
                      <button
                        key={entry.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={cn(
                          "vm-phone-option",
                          active && "is-active",
                        )}
                        onClick={() => {
                          onChange(entry.value);
                          setOpen(false);
                        }}
                      >
                        <span className="vm-phone-flag">
                          {OptionFlag ? (
                            <OptionFlag title={entry.label} />
                          ) : null}
                        </span>
                        <span className="vm-phone-name">{entry.label}</span>
                        <span className="vm-phone-option-dial">+{dial}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function InputComponent({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("vm-phone-national", className)} {...props} />;
}

/**
 * Phone field with searchable country picker (react-phone-number-input, same as evergreen-webby).
 *
 * @param value - E.164 phone string
 * @param onChange - Called with updated E.164 string
 */
export function PhoneInput({
  id,
  value,
  onChange,
  disabled,
  className,
}: PhoneInputProps) {
  return (
    <PhoneInputBase
      id={id}
      className={cn("vm-phone-input", className)}
      defaultCountry="US"
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      placeholder="(555) 000-0000"
      disabled={disabled}
      value={(value || undefined) as Value | undefined}
      onChange={(next) => onChange(next || "")}
    />
  );
}
