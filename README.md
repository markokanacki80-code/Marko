# Digitaler Unfall-Meldeblock

Static HTML/CSS/JavaScript form hosted on GitHub Pages. Form submissions are sent to the configured Google Apps Script endpoint; this browser app does not keep a local submission database or generate an Excel export. The Apps Script endpoint must append each submission to the Google Sheet and send the email notification.

## Important setup

The front end sends URL-encoded fields to the Apps Script `doPost(e)` handler. Configure that script to write the fields to the intended spreadsheet and send a notification email. Deploy the updated Apps Script as a web app and make sure the existing `/exec` URL points to the latest deployment. The browser uses `no-cors`, so it cannot verify whether the script saved the row or sent the email; test with non-sensitive data and check both the Sheet and inbox.

Do not use a public, unauthenticated endpoint for real injury or employee data without authorization and appropriate access controls. GitHub Pages is public hosting and the form endpoint URL is visible in the app.
