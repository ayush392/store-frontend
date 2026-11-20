import { REGEX } from '../shared/schemas/common.schema';

// Contact Picker API (navigator.contacts). TypeScript's DOM types don't
// include it, so only the parts this app uses are typed here.
// Supported in Chrome on Android; other browsers fall back to manual entry.
// https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API
type ContactProperty = 'name' | 'tel';

export type ContactInfo = {
  name?: string[];
  tel?: string[];
};

export type ContactsManagerLike = {
  select: (
    properties: ContactProperty[],
    options?: { multiple?: boolean }
  ) => Promise<ContactInfo[]>;
};

export type PickResult =
  | { status: 'cancelled' }
  | { status: 'error' }
  | { status: 'empty' } // the contact has no name and no phone number
  | { status: 'picked'; name?: string; phone?: string; phoneIsValid: boolean };

// Values to put into the form. Only non-empty values are included, so a
// missing name or number never clears what the user already typed.
export type ContactFields = { name?: string; phone?: string };

const isContactsManager = (value: unknown): value is ContactsManagerLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { select?: unknown }).select === 'function';

// Returns the browser's contacts manager, or null when the picker can't be
// used here (unsupported browser, non-HTTPS page, or inside a frame). This
// only checks for the API; it doesn't open the picker or ask for permission.
export const getContactsManager = (): ContactsManagerLike | null => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }
  if (!window.isSecureContext) return null;
  try {
    if (window.top !== window.self) return null;
  } catch {
    return null; // a cross-origin parent can't be read: treat as a frame
  }
  const contacts = (navigator as Navigator & { contacts?: unknown }).contacts;
  return isContactsManager(contacts) ? contacts : null;
};

// Turns a number from the address book into the app's format (10-digit
// Indian mobile, REGEX.phone) when that is unambiguous: removes spaces,
// dashes, dots and brackets, then a +91 / 91 country code or a leading 0.
// Returns null when the result still isn't valid.
export const normalizePhone = (raw: string): string | null => {
  let digits = raw.trim().replace(/[\s\-\u2010-\u2015().]/g, '');
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return REGEX.phone.test(digits) ? digits : null;
};

const nonEmpty = (values: unknown): string[] =>
  Array.isArray(values)
    ? values
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

// Picks the values to use from one contact: the first non-empty name, and
// the first number that is a valid mobile number. If no number is valid, the
// first non-empty number is kept as it is so the user can see and fix it.
export const readContact = (contact: ContactInfo | undefined): PickResult => {
  const name = nonEmpty(contact?.name)[0];
  const numbers = nonEmpty(contact?.tel);
  const validPhone = numbers
    .map(normalizePhone)
    .find((phone): phone is string => phone !== null);
  const phone = validPhone ?? numbers[0];
  if (!name && !phone) return { status: 'empty' };
  return { status: 'picked', name, phone, phoneIsValid: !!validPhone };
};

// Opens the native picker for one contact, asking only for name and phone.
// Call this from a click handler: browsers require a user gesture.
export const pickContact = async (
  manager: ContactsManagerLike
): Promise<PickResult> => {
  let contacts: ContactInfo[];
  try {
    contacts = await manager.select(['name', 'tel'], { multiple: false });
  } catch {
    // Not logged: the error can't contain contact data, but nothing about
    // the picker is worth sending to the console either.
    return { status: 'error' };
  }
  // The user closed the picker without choosing anyone.
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return { status: 'cancelled' };
  }
  return readContact(contacts[0]);
};

export const contactFieldUpdates = (result: PickResult): ContactFields => {
  if (result.status !== 'picked') return {};
  const updates: ContactFields = {};
  if (result.name) updates.name = result.name;
  if (result.phone) updates.phone = result.phone;
  return updates;
};

// Short status shown under the button after a pick (null: show nothing).
export const describeContactResult = (result: PickResult): string | null => {
  if (result.status === 'empty') {
    return 'That contact has no name or phone number.';
  }
  if (result.status !== 'picked') return null;
  const phoneNote =
    result.phone && !result.phoneIsValid
      ? " The phone number isn't a 10-digit mobile number; please correct it."
      : '';
  if (result.name && result.phone) {
    return `Name and phone filled from contacts. Check them before saving.${phoneNote}`;
  }
  if (result.name) return 'Name filled. That contact has no phone number.';
  return `Phone filled. That contact has no name.${phoneNote}`;
};
