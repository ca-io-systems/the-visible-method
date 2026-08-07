"use client";

import { useEffect, useState } from "react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/components/phone-input";
import "./workshop-optin.css";

declare global {
  interface Window {
    openWorkshopOptin?: () => void;
    smoothNavigate?: (url: string) => void;
  }
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

/**
 * Opens the workshop opt-in modal from HTML CTAs via window.openWorkshopOptin.
 *
 * @returns Workshop registration modal
 */
export function WorkshopOptInModal() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<Partial<Record<keyof FormState, boolean>>>(
    {},
  );
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    window.openWorkshopOptin = () => {
      setError("");
      setInvalid({});
      setOpen(true);
    };
    return () => {
      delete window.openWorkshopOptin;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.documentElement.classList.remove("optin-open");
      document.body.classList.remove("optin-open");
      return;
    }

    document.documentElement.classList.add("optin-open");
    document.body.classList.add("optin-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("optin-open");
      document.body.classList.remove("optin-open");
    };
  }, [open]);

  function queryParam(key: string): string {
    return new URLSearchParams(window.location.search).get(key) || "";
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, boolean>> = {};
    if (!form.firstName.trim()) next.firstName = true;
    if (!form.lastName.trim()) next.lastName = true;
    if (!form.email.trim() || !form.email.includes("@")) next.email = true;
    if (!form.phone.trim() || !isValidPhoneNumber(form.phone)) next.phone = true;
    setInvalid(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: Record<string, string> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: "workshop",
        optin_url: window.location.href,
      };

      const hyrosTag = queryParam("hyros_tag") || queryParam("ht");
      if (hyrosTag) payload.hyros_tag = hyrosTag;
      const revenue = queryParam("revenue");
      if (revenue) payload.revenue = revenue;

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit failed");

      if (window.smoothNavigate) {
        window.smoothNavigate("/studio-session");
      } else {
        window.location.href = "/studio-session";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="vm-optin-modal" role="presentation">
      <div
        className="vm-optin-backdrop"
        onClick={() => !submitting && setOpen(false)}
      />
      <div
        className="vm-optin-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vm-optin-title"
      >
        <button
          type="button"
          className="vm-optin-close"
          aria-label="Close"
          onClick={() => !submitting && setOpen(false)}
        >
          &times;
        </button>
        <div className="vm-optin-title" id="vm-optin-title">
          Save your seat for August 13.
        </div>
        <p className="vm-optin-copy">
          The room is capped so everyone gets seen. First name, last name,
          email, phone — that&apos;s it. I&apos;ll text you the morning we go
          live.
        </p>
        <form className="vm-optin-form" onSubmit={onSubmit} noValidate>
          <div className="vm-optin-field">
            <label htmlFor="vm-r-name">First name</label>
            <input
              id="vm-r-name"
              name="name"
              type="text"
              placeholder="Your first name"
              autoComplete="given-name"
              className={invalid.firstName ? "is-invalid" : undefined}
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
              required
            />
          </div>
          <div className="vm-optin-field">
            <label htmlFor="vm-r-last">Last name</label>
            <input
              id="vm-r-last"
              name="lastName"
              type="text"
              placeholder="Your last name"
              autoComplete="family-name"
              className={invalid.lastName ? "is-invalid" : undefined}
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
              required
            />
          </div>
          <div className="vm-optin-field">
            <label htmlFor="vm-r-email">Email</label>
            <input
              id="vm-r-email"
              name="email"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              className={invalid.email ? "is-invalid" : undefined}
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </div>
          <div className="vm-optin-field">
            <label htmlFor="vm-r-phone">Phone number</label>
            <PhoneInput
              id="vm-r-phone"
              value={form.phone}
              onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
              className={invalid.phone ? "is-invalid" : undefined}
              disabled={submitting}
            />
          </div>
          {error ? <p className="vm-optin-error">{error}</p> : null}
          <button className="vm-optin-submit" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save my spot"}
          </button>
        </form>
      </div>
    </div>
  );
}
