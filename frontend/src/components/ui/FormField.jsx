// Label + control + message, wired together for accessibility.
// `children` is a function that receives the props the control needs
// (id, aria attributes, styling) so the same field works for <input>,
// <select> and <textarea>:
//
//   <FormField id="x" label="Name" error={error}>
//     {(controlProps) => <input {...controlProps} />}
//   </FormField>

function controlClassName(hasError) {
  const base =
    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:outline-2 focus:outline-offset-0';
  const state = hasError
    ? 'border-danger focus:outline-danger'
    : 'border-line hover:border-muted/50 focus:border-brand-600 focus:outline-brand-600/30';
  return `${base} ${state}`;
}

export default function FormField({ id, label, error, hint, children }) {
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>

      {children({
        id,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': hasMessage ? messageId : undefined,
        className: controlClassName(Boolean(error)),
      })}

      {hasMessage && (
        <p id={messageId} className={`mt-1.5 text-sm ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
