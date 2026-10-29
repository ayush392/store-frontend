import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '../../components/Button';
import { PasswordInput } from '../../components/form/PasswordInput';
import { TextInput } from '../../components/form/TextInput';
import { PageLayout } from '../../components/Layout';
import { fetcher } from '../../lib/fetcher';
import { notifyError } from '../../lib/toast';
import type { LoginUser } from '../../shared/schemas/auth.schema';
import { LoginUserSchema } from '../../shared/schemas/auth.schema';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage
});

function LoginPage() {
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (formData: LoginUser) =>
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
      onSubmit: LoginUserSchema
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
                  type="tel"
                  inputMode="numeric"
                  autoComplete="username"
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
              <p role="alert" className="mt-1 text-sm text-error">
                {error?.message}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              className="mt-3"
              disabled={isPending}
            >
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
