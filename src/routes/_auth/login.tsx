import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PasswordInput } from '../../components/form/PasswordInput';
import { TextInput } from '../../components/form/TextInput';
import { fetcher } from '../../lib/fetcher';
import { notifyError } from '../../lib/toast';
import type { LoginUser } from '../../shared/schemas/auth.schema';
import { LoginUserSchema } from '../../shared/schemas/auth.schema';
import { haptics } from '../../shared/utils/haptics';

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
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col justify-center pt-[env(safe-area-inset-top,0px)]">
      <div className="mb-8 text-center animate-rise-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
          DB
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage your store</p>
      </div>

      <div className="card p-5 animate-rise-in">
          <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              haptics.medium();
              form.handleSubmit();
            }}
          >
            <Field name="phone">
              {(field) => (
                <TextInput
                  label="Phone"
                  field={field}
                  type="tel"
                  inputMode="tel"
                  autoComplete="username"
                  placeholder="10-digit mobile number"
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
              <p role="alert" className="field-error">
                {error.message}
              </p>
            )}

            <button disabled={isPending} type="submit" className="btn btn-lg btn-primary mt-2">
              {isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
      </div>
    </div>
  );
}
