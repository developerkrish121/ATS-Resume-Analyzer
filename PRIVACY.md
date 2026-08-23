# Privacy and data handling

The application stores the original resume filename, the job description, deterministic ATS analysis, optional Gemini insights, timestamps, and the uploaded PDF while the saved analysis exists. It does not persist extracted resume text for newly created analyses.

This data is stored to let users reopen a saved analysis after refreshing the dashboard. The history endpoint returns only the filename, score, analysis ID, and dates. Analysis retrieval returns the dashboard data and never returns uploaded filesystem paths or extracted resume text.

Users can delete a saved analysis from Analysis History. Deletion removes its database record and attempts to remove its associated uploaded PDF. There is currently no automatic retention period; saved analyses remain until deleted.
