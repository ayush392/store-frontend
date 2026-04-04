import { Auth } from '@store/schemas';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PasswordInput } from '../../components/form/PasswordInput';
import { TextInput } from '../../components/form/TextInput';
import { PageLayout } from '../../components/Layout';
import { fetcher } from '../../lib/fetcher';
import { notifyError } from '../../lib/toast';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage
});

function LoginPage() {
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (formData: Auth.LoginUser) =>
      fetcher<{ name: string; role: string; token: string }>(
        '/auth/login',
        'POST',
        formData
      ),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      navigate({ to: '/' });
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const form = useForm({
    defaultValues: {
      phone: '',
      password: ''
    },
    onSubmit: ({ value }) => {
      mutate(value);
    },
    validators: {
      onSubmit: Auth.LoginUserSchema,
      onBlur: Auth.LoginUserSchema
    }
  });

  const { Field } = form;

  return (
    <PageLayout title="">
      <div className="flex items-center justify-center min-h-[calc(100vh-280px)]">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login
          </h1>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Field name="phone">
              {(field) => (
                <TextInput
                  label="Phone"
                  field={field}
                  placeholder="Enter your phone number"
                />
              )}
            </Field>

            <Field name="password">
              {(field) => (
                <PasswordInput
                  label="Password"
                  field={field}
                  placeholder="Enter your password"
                />
              )}
            </Field>

            {error && (
              <p className="text-red-500 text-xs mt-1">{error?.message}</p>
            )}

            <button
              disabled={isPending}
              type="submit"
              className="w-full bg-blue-600 text-white mt-3 py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-60 active:bg-blue-700"
            >
              {isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
