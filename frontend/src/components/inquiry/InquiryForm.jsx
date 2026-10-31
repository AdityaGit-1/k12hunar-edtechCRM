import { useState } from 'react';
import FormField from '../ui/FormField.jsx';
import Button from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { submitInquiry } from '../../api/inquiryApi.js';
import { ApiError } from '../../api/client.js';
import { USER_TYPE_OPTIONS, CATEGORY_OPTIONS } from '../../lib/constants.js';
import {
  INQUIRY_FIELDS,
  MESSAGE_MAX_LENGTH,
  validateField,
  validateInquiry,
} from '../../lib/validators.js';

const EMPTY_VALUES = {
  userType: '',
  category: '',
  name: '',
  email: '',
  phone: '',
  message: '',
};

const fieldId = (field) => `inquiry-${field}`;

// `onSubmitted` receives the API result ({ id, createdAt }) and the submitted name.
export default function InquiryForm({ onSubmitted }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));

    // Once a field has shown an error, re-check it as the visitor fixes it,
    // so the message disappears right away. Untouched fields stay quiet.
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
    }
  }

  // Validate a field when the visitor leaves it. A field they only tabbed
  // through without typing is not flagged; submitting catches it instead.
  function handleBlur(event) {
    const { name, value } = event.target;
    if (value.trim() === '' && !errors[name]) return;
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    const validationErrors = validateInquiry(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstInvalid = INQUIRY_FIELDS.find((field) => validationErrors[field]);
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value.trim()])
      );
      const result = await submitInquiry(payload);
      onSubmitted(result, payload.name);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.length > 0) {
        // The server rejected specific fields: show each message next to its field.
        const serverErrors = {};
        for (const { field, message } of error.fieldErrors) {
          if (INQUIRY_FIELDS.includes(field)) serverErrors[field] = message;
        }
        setErrors(serverErrors);
        setSubmitError('Please correct the highlighted fields and try again.');
      } else {
        setSubmitError(
          error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (field) => ({
    name: field,
    value: values[field],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink">Send us an inquiry</h2>
        <p className="mt-1 text-sm text-muted">All fields are required.</p>
      </div>

      {submitError && <Alert>{submitError}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={fieldId('userType')} label="I am a" error={errors.userType}>
          {(controlProps) => (
            <select {...controlProps} {...fieldProps('userType')} className={`${controlProps.className} control-select`}>
              <option value="" disabled>
                Select one
              </option>
              {USER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField id={fieldId('category')} label="Category" error={errors.category}>
          {(controlProps) => (
            <select {...controlProps} {...fieldProps('category')} className={`${controlProps.className} control-select`}>
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <FormField id={fieldId('name')} label="Full name" error={errors.name}>
        {(controlProps) => (
          <input
            {...controlProps}
            {...fieldProps('name')}
            type="text"
            autoComplete="name"
            placeholder="e.g. Asha Verma"
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={fieldId('email')} label="Email" error={errors.email}>
          {(controlProps) => (
            <input
              {...controlProps}
              {...fieldProps('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          )}
        </FormField>

        <FormField id={fieldId('phone')} label="Phone number" error={errors.phone}>
          {(controlProps) => (
            <input
              {...controlProps}
              {...fieldProps('phone')}
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
          )}
        </FormField>
      </div>

      <FormField
        id={fieldId('message')}
        label="Message"
        error={errors.message}
        hint={`${values.message.length}/${MESSAGE_MAX_LENGTH} characters`}
      >
        {(controlProps) => (
          <textarea
            {...controlProps}
            {...fieldProps('message')}
            rows={5}
            placeholder="Tell us what you would like to know"
            className={`${controlProps.className} resize-y`}
          />
        )}
      </FormField>

      <Button type="submit" loading={submitting} className="w-full sm:w-auto">
        {submitting ? 'Submitting...' : 'Submit inquiry'}
      </Button>
    </form>
  );
}
