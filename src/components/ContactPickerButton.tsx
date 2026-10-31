import { useState } from 'react';
import { FiBook } from 'react-icons/fi';
import {
  contactFieldUpdates,
  describeContactResult,
  getContactsManager,
  pickContact,
  type ContactFields
} from '../lib/contactPicker';
import { notifyError } from '../lib/toast';
import { Button } from './Button';

type Props = {
  // Receives only non-empty values; the form decides what to fill.
  onPick: (fields: ContactFields) => void;
};

// "Choose from contacts" for the account create forms. Where the Contact
// Picker API isn't available, shows a short note instead of the button; the
// manual fields work as before either way.
export const ContactPickerButton = ({ onPick }: Props) => {
  // Feature check once, on mount. It doesn't open anything or ask for access.
  const [manager] = useState(() => getContactsManager());
  const [isPicking, setIsPicking] = useState(false);
  const [status, setStatus] = useState('');

  if (!manager) {
    return (
      <p className="text-sm text-fg-secondary">
        Choosing from contacts isn't supported in this browser. Enter the
        details below.
      </p>
    );
  }

  const choose = async () => {
    if (isPicking) return;
    setIsPicking(true);
    const result = await pickContact(manager);
    setIsPicking(false);
    if (result.status === 'cancelled') return;
    if (result.status === 'error') {
      notifyError("Couldn't open your contacts. Enter the details manually.");
      return;
    }
    const updates = contactFieldUpdates(result);
    if (updates.name || updates.phone) onPick(updates);
    setStatus(describeContactResult(result) ?? '');
  };

  return (
    <div>
      <Button
        variant="secondary"
        fullWidth
        onClick={choose}
        disabled={isPicking}
      >
        <FiBook size={18} aria-hidden="true" />
        {isPicking ? 'Opening contacts...' : 'Choose from contacts'}
      </Button>
      {/* Always rendered so screen readers announce the message. */}
      <p
        role="status"
        className={`text-sm text-fg-secondary ${status ? 'mt-1.5' : ''}`}
      >
        {status}
      </p>
    </div>
  );
};
