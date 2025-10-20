import React, { useState } from "react";
import { Main } from "../components/Layouts";
import { SEO } from "../components/SEO";
import { FadeInText } from "../components/TextAnimation";
import {
  Calendar,
  BookingForm,
  PendingRequests,
} from "../components/SwagCalendar";
import Link from "next/link";

interface SwagPageProps {
  pendingRequests: { companyName: string; count: number }[];
  submissionCounts: { [date: string]: number };
}

export default function SwagPage({
  pendingRequests,
  submissionCounts,
}: SwagPageProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmitSuccess = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <>
      <SEO
        seo={{
          title: "Swag Calendar",
          description:
            "Send your company swag. I'll wear it for a full day and post on X.",
          path: "/swag",
        }}
      />
      <Main>
        <header className="mb-8">
          <h1 className="mb-4 text-xl text-neutral-800 [font-variation-settings:'opsz'_32,_'wght'_500] dark:text-white sm:text-2xl">
            <FadeInText text="Swag Calendar" delay={0} duration={600} />
          </h1>
          <div className="text-neutral-600 dark:text-silver-dark">
            <FadeInText text="" delay={300}>
              <p className="mb-4">
                Send your company swag. I'll wear it for a full day and post on
                X{" "}
                <a
                  href="https://x.com/naveenbandarage/status/1879724419449163852"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  (see thread here)
                </a>
                . Tap on an available date below.
              </p>
            </FadeInText>
          </div>
        </header>

        <div className="mb-12">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            submissions={submissionCounts}
          />
        </div>

        <div>
          <PendingRequests requests={pendingRequests} />
          <BookingForm
            selectedDate={selectedDate}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>

        <div className="mt-8 text-sm text-neutral-500 dark:text-silver-dark">
          <p>
            Need help or have questions?{" "}
            <Link href="/about" className="link">
              Contact me
            </Link>
          </p>
        </div>
      </Main>
    </>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch pending requests from API
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/swag-requests`);
    const data = await response.json();

    return {
      props: {
        pendingRequests: data.pendingRequests || [],
        submissionCounts: data.submissionCounts || {},
      },
    };
  } catch (error) {
    console.error("Error fetching swag requests:", error);
    return {
      props: {
        pendingRequests: [],
        submissionCounts: {},
      },
    };
  }
}
