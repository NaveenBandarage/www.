import type { NextApiRequest, NextApiResponse } from "next";
import { list } from "@vercel/blob";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // List all submissions from Vercel Blob under swag/ prefix
    const { blobs } = await list({
      prefix: "swag/",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Parse and group submissions
    const submissionsByDate: { [date: string]: any[] } = {};
    const pendingRequests: { [company: string]: number } = {};

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const data = await response.json();

        // Group by date
        if (!submissionsByDate[data.date]) {
          submissionsByDate[data.date] = [];
        }
        submissionsByDate[data.date].push(data);

        // Count by company
        pendingRequests[data.companyName] =
          (pendingRequests[data.companyName] || 0) + 1;
      } catch (err) {
        console.error("Error parsing blob:", err);
      }
    }

    // Format pending requests for display
    const formattedRequests = Object.entries(pendingRequests).map(
      ([companyName, count]) => ({
        companyName,
        count,
      }),
    );

    // Count submissions per date
    const submissionCounts: { [date: string]: number } = {};
    Object.entries(submissionsByDate).forEach(([date, submissions]) => {
      submissionCounts[date] = submissions.length;
    });

    return res.status(200).json({
      pendingRequests: formattedRequests,
      submissionCounts,
      allSubmissions: submissionsByDate,
    });
  } catch (error) {
    console.error("Error fetching swag requests:", error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
}
