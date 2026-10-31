import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import FormField from '../components/ui/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../api/client.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors loginSchema in backend/src/validators/authValidators.js.
function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = 'HunarDesk | Admin login';
  }, []);

  // Already logged in: go straight to the dashboard.
  if (status === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.getElementById(validationErrors.email ? 'login-email' : 'login-password')?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(location.state?.from ?? '/admin', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.length > 0) {
        const serverErrors = {};
        for (const { field, message } of error.fieldErrors) serverErrors[field] = message;
        setErrors(serverErrors);
        setSubmitError('Please correct the highlighted fields and try again.');
      } else {
        // Wrong credentials arrive here as "Invalid email or password" (401).
        setSubmitError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" aria-label="HunarDesk home">
        <Logo />
      </Link>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold tracking-tight text-ink">Admin login</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage inquiries.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {submitError && <Alert>{submitError}</Alert>}

          <FormField id="login-email" label="Email" error={errors.email}>
            {(controlProps) => (
              <input
                {...controlProps}
                name="email"
                type="email"
                autoComplete="username"
                value={values.email}
                onChange={handleChange}
                placeholder="admin@example.com"
              />
            )}
          </FormField>

          <FormField id="login-password" label="Password" error={errors.password}>
            {(controlProps) => (
              <div className="relative">
                <input
                  {...controlProps}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  className={`${controlProps.className} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 px-3.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            )}
          </FormField>

          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>

      <Link to="/" className="mt-6 text-sm font-medium text-brand-700 hover:text-brand-800">
        &larr; Back to the inquiry form
      </Link>
    </div>
  );
}
