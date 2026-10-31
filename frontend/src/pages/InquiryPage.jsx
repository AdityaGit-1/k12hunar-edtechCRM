import { useState } from 'react';
import InquiryForm from '../components/inquiry/InquiryForm.jsx';
import SuccessMessage from '../components/inquiry/SuccessMessage.jsx';
import { CATEGORY_OPTIONS } from '../lib/constants.js';

export default function InquiryPage() {
  // null while the visitor is filling in the form; { id, name } after a successful submit.
  const [submission, setSubmission] = useState(null);

  function handleSubmitted(result, name) {
    setSubmission({ id: result.id, name });
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-16">
      <section className="lg:col-span-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Inquiries</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          How can we help you?
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          Tell us who you are and what you need. Your inquiry goes straight to our team.
        </p>

        <ul className="mt-8 hidden space-y-4 lg:block">
          {CATEGORY_OPTIONS.map((category) => (
            <li key={category.value} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-ink">{category.label}</p>
                <p className="text-sm text-muted">{category.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-span-7">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          {submission ? (
            <SuccessMessage submission={submission} onReset={() => setSubmission(null)} />
          ) : (
            <InquiryForm onSubmitted={handleSubmitted} />
          )}
        </div>
      </section>
    </div>
  );
}
