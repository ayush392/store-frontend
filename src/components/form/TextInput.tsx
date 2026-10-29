import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

interface TextInputProps extends FormInputProps {
  placeholder: string;
  type?: 'text' | 'tel';
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
}

export const TextInput = ({
  label,
  field,
  placeholder,
  disabled = false,
  error,
  type = 'text',
  inputMode,
  autoComplete
}: TextInputProps) => {
  return (
    <FormField label={label} field={field} error={error}>
      {(control) => (
        <input
          {...control}
          className={`${control.className} h-11`}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
};

/*  -------------------------------

function CustomersPage() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button onClick={openModal}>New Customer</button>

      {isOpen && (
        <ModalContainer title="New Customer" onClose={closeModal}>
          <CustomerForm
            onSubmit={(values) => {
              createCustomer(values);
              closeModal();
            }}
            onCancel={closeModal}
          />
        </ModalContainer>
      )}
    </>
  );
}

function ModalContainer({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">{title}</h3>

          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function CustomerForm({ onSubmit, onCancel }) {
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <input
        value={form.state.values.name}
        onChange={(e) => form.setFieldValue("name", e.target.value)}
      />

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
*/
