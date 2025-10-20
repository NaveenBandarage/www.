# Swag Calendar Setup Guide

## Overview

The swag calendar feature allows companies to request swag bookings. When a submission is made, it's stored in Vercel Blob and creates a GitHub Issue for notification.

## Environment Variables Required

Add these to your `.env.local` file and Vercel environment variables:

### 1. Vercel Blob Storage (Already configured)

```
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

This is already configured for your analytics feature.

### 2. GitHub Token (New - Required for notifications)

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO=naveenbandarage/www.
```

## Setting Up GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "Swag Calendar Notifications"
4. Set expiration (recommend: 90 days or No expiration)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
     - This includes `public_repo` access needed for creating issues
6. Click "Generate token"
7. Copy the token immediately (you won't see it again!)
8. Add to your `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

## Adding to Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add these variables:
   - `GITHUB_TOKEN` → your personal access token
   - `GITHUB_REPO` → `naveenbandarage/www.` (or your repo path)
4. Select all environments (Production, Preview, Development)
5. Save

## Testing Locally

1. Create `.env.local` with the required tokens
2. Run the development server:
   ```bash
   bun run dev
   ```
3. Navigate to `http://localhost:3000/swag`
4. Select a date and submit a test request
5. Check that:
   - Data is stored in Vercel Blob (check your Vercel dashboard)
   - A GitHub Issue is created in your repository

## Features

### Calendar

- Shows October 2025
- Displays submission counts per date
- Visual feedback for selected dates
- Click to select a date for booking

### Booking Form

- Company Name (required)
- Company Email (required)
- Swag Description (required, min 5 characters)
- Form validation before submission
- Success/error feedback

### GitHub Issue Creation

When a submission is made, a GitHub Issue is automatically created with:

- Title: `🎽 Swag Request: [Company] - [Date]`
- Body includes: Date, Company Name, Email, Swag Description, Timestamp
- Label: `swag-request` (will be created automatically on first use)
- You'll receive a GitHub notification immediately

### Data Storage

Submissions are stored in Vercel Blob under the path:

```
swag/[date]/[timestamp]-[company-name].json
```

## Accessing Submissions

### Via API

- GET `/api/swag-requests` - Returns all pending requests and submission counts
- POST `/api/swag-submit` - Submit a new swag request

### Via GitHub

- Go to your repository's Issues tab
- Filter by label: `swag-request`
- Each issue represents one submission
- You can comment, close, or manage them like any GitHub Issue

## Managing Requests

1. **View all requests**: Visit `/swag` page or check GitHub Issues
2. **Accept a request**: Close the GitHub Issue and reach out to the company
3. **Decline a request**: Close the GitHub Issue with a comment
4. **Track status**: Use GitHub Issue labels and comments

## Troubleshooting

### GitHub Issues not being created

- Check that `GITHUB_TOKEN` is set correctly in Vercel
- Verify token has `repo` scope
- Check Vercel function logs for errors
- Ensure `GITHUB_REPO` format is correct: `username/repo-name`

### Submissions not showing on page

- Check Vercel Blob storage in your Vercel dashboard
- Verify `BLOB_READ_WRITE_TOKEN` is configured
- Check API route logs: `/api/swag-requests`

### Form not submitting

- Check browser console for errors
- Verify all required fields are filled
- Ensure swag description is at least 5 characters
- Check that a date is selected

## Security Notes

- GitHub token should be kept secret
- Don't commit `.env.local` to version control
- Blob storage is public read, write requires token
- API routes validate all inputs before processing
- Consider adding rate limiting for production use

## Future Enhancements

Consider adding:

- Email notifications (Resend/SendGrid)
- Admin dashboard for managing requests
- Calendar availability management
- Multiple calendar months
- Company logo uploads
- Voting system for community choice
- Rate limiting on form submissions
