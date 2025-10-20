import type { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date, companyName, companyEmail, swagDescription } = req.body;

  // Validate required fields
  if (!date || !companyName || !companyEmail || !swagDescription) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (swagDescription.length < 5) {
    return res
      .status(400)
      .json({ error: "Swag description must be at least 5 characters" });
  }

  // Check for required environment variables
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not set");
    return res.status(500).json({
      error:
        "Server configuration error: Missing BLOB_READ_WRITE_TOKEN. Please add it to your .env.local file.",
    });
  }

  try {
    console.log("Submitting swag request:", {
      date,
      companyName,
      companyEmail,
    });
    const now = new Date();
    const timestamp = now.getTime();
    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9-]/g, "-");
    const key = `swag/${date}/${timestamp}-${sanitizedCompanyName}.json`;

    const submission = {
      date,
      companyName,
      companyEmail,
      swagDescription,
      submittedAt: now.toISOString(),
    };

    // Store in Vercel Blob
    console.log("Storing in Vercel Blob:", key);
    await put(key, JSON.stringify(submission), {
      access: "public",
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log("Successfully stored in Vercel Blob");

    // Create GitHub Issue for notification
    try {
      console.log("Attempting to create GitHub Issue...");
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPO || "naveenbandarage/www.";

      if (githubToken) {
        const githubResponse = await fetch(
          `https://api.github.com/repos/${githubRepo}/issues`,
          {
            method: "POST",
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: `🎽 Swag Request: ${companyName} - ${date}`,
              body: `**Date:** ${date}
**Company:** ${companyName}
**Email:** ${companyEmail}

**Swag Description:**
${swagDescription}

---
*Submitted at ${now.toISOString()}*`,
              labels: ["swag-request"],
            }),
          },
        );

        if (githubResponse.ok) {
          console.log("✅ GitHub Issue created successfully");
        } else {
          console.error(
            "❌ GitHub Issue creation failed:",
            await githubResponse.text(),
          );
        }
      } else {
        console.warn("⚠️ GITHUB_TOKEN not set, skipping GitHub Issue creation");
      }
    } catch (githubError) {
      // Log but don't fail the request if GitHub API fails
      console.error("Failed to create GitHub issue:", githubError);
    }

    console.log("✅ Swag request submitted successfully");
    return res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error("❌ Error submitting swag request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit request";
    return res.status(500).json({
      error: "Failed to submit request",
      details: errorMessage,
    });
  }
}
