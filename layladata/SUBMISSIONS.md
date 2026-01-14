# Layla Invitation Submissions

## How Form Submissions Work

When someone fills out the "Request an invitation" form on the landing page:

1. The form data is POSTed to `/api/submit-invitation`
2. The backend validates and stores the submission in memory
3. A success message is displayed to the user
4. The submission is logged to the console

## Viewing Submissions

### Method 1: Admin Endpoint (Recommended)

Visit this URL in your browser:
```
https://layladata.com/api/submissions
```

This will show you a JSON response with all submissions, like:
```json
{
  "total": 3,
  "submissions": [
    {
      "id": "abc123...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Data Scientist",
      "company": "Tech Corp",
      "workDescription": "Building ML models...",
      "whoToMeet": "Other data scientists...",
      "submittedAt": "2025-01-10T15:30:00.000Z"
    }
  ]
}
```

### Method 2: Server Console Logs

Check the Replit console where your server is running. Each submission will log:
```
✅ New invitation request from: Jane Smith (jane@example.com)
```

## Important Notes

- **Data Persistence**: Submissions are stored in memory (MemStorage). Data will be **lost when the server restarts**.
- **No Authentication**: The `/api/submissions` endpoint is public—anyone with the URL can view submissions.
- **Upgrade Path**: For production, consider:
  - Using Replit Database for persistent storage
  - Adding authentication to the admin endpoint
  - Setting up email notifications when new submissions arrive

## Testing the Form

1. Go to https://layladata.com
2. Scroll to the "Request an invitation" section
3. Fill out all fields
4. Click "Submit"
5. You should see a success toast notification
6. Check submissions at https://layladata.com/api/submissions
