import React, { useState } from "react";

interface BookingFormProps {
  selectedDate: string | null;
  onSubmitSuccess: () => void;
}

export default function BookingForm({
  selectedDate,
  onSubmitSuccess,
}: BookingFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [swagDescription, setSwagDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    companyName.trim() &&
    companyEmail.trim() &&
    swagDescription.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      setError("Please select a date from the calendar");
      return;
    }

    if (!isValid) {
      setError(
        "Please fill out all fields. Swag description must be at least 5 characters.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Submitting form...");
      const response = await fetch("/api/swag-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          companyName: companyName.trim(),
          companyEmail: companyEmail.trim(),
          swagDescription: swagDescription.trim(),
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Failed to submit request",
        );
      }

      // Clear form
      setCompanyName("");
      setCompanyEmail("");
      setSwagDescription("");

      // Show success and refresh
      alert("Success! Your swag request has been submitted.");
      onSubmitSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit request. Please try again.";
      setError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-lg font-medium text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]">
        Reserve Your Date
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="selected-date"
            className="mb-1 block text-sm text-neutral-600 dark:text-silver-dark"
          >
            Selected Date
          </label>
          <input
            id="selected-date"
            type="text"
            value={selectedDate || ""}
            readOnly
            placeholder="Select a date from the calendar"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-silver"
          />
        </div>

        <div>
          <label
            htmlFor="company-name"
            className="mb-1 block text-sm text-neutral-600 dark:text-silver-dark"
          >
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Acme Corp"
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-800 transition-colors focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-silver dark:focus:border-neutral-600"
          />
        </div>

        <div>
          <label
            htmlFor="company-email"
            className="mb-1 block text-sm text-neutral-600 dark:text-silver-dark"
          >
            Company Email <span className="text-red-500">*</span>
          </label>
          <input
            id="company-email"
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="e.g., marketing@acme.com"
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-800 transition-colors focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-silver dark:focus:border-neutral-600"
          />
        </div>

        <div>
          <label
            htmlFor="swag-description"
            className="mb-1 block text-sm text-neutral-600 dark:text-silver-dark"
          >
            Swag Description <span className="text-red-500">*</span>{" "}
            <span className="text-xs">(min 5 characters)</span>
          </label>
          <textarea
            id="swag-description"
            value={swagDescription}
            onChange={(e) => setSwagDescription(e.target.value)}
            placeholder="Tell me about the swag you're sending (e.g., Black hoodie with company logo, size L)"
            required
            rows={4}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-800 transition-colors focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-silver dark:focus:border-neutral-600"
          />
          <div className="mt-1 text-xs text-neutral-500 dark:text-silver-dark">
            {swagDescription.length} characters{" "}
            {swagDescription.length < 5 &&
              `(${5 - swagDescription.length} more needed)`}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting || !selectedDate}
          className="w-full rounded-lg bg-neutral-800 px-4 py-2.5 font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200 [font-variation-settings:'wght'_500]"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
