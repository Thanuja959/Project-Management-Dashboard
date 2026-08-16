# Email Service

This project uses a **simulated email service** — no real emails are sent. The service is structured so a real email provider can be connected later without changing the calling code.

## How it works

### `src/services/emailService.ts`

All email building and sending logic lives here.

- `buildWelcomeEmail(user)` — generates a credentials email when a new user is added
- `buildProjectAssignedEmail(user, project)` — generates a project assignment email
- `buildTaskAssignedEmail(user, task, project)` — generates a task assignment email
- `sendMockEmail(email)` — stores the email in the app's localStorage-backed email log

### Connecting a real provider

To send real emails, replace the body of `sendMockEmail` with a call to your email provider's API (e.g. EmailJS, SendGrid, Postmark, or a Supabase Edge Function). The `EmailContent` interface is the only contract:

```typescript
interface EmailContent {
  to: string;
  toName: string;
  subject: string;
  body: string;
}
```

#### Example: EmailJS integration

```typescript
import emailjs from '@emailjs/browser';

export function sendMockEmail(email: EmailContent): void {
  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
    to_email: email.to,
    to_name: email.toName,
    subject: email.subject,
    message: email.body,
  }, 'YOUR_PUBLIC_KEY');
}
```

> Never expose API keys in client-side code in production. Use a Supabase Edge Function or backend proxy for real credentials.

## When emails are sent

| Trigger | Email type |
|---|---|
| Admin adds a new user | Welcome email with login credentials |
| Admin assigns a project to a user | Project assignment notification |
| Admin assigns a task to a user | Task assignment notification |

Each sent email is stored in the app's email log and can be previewed via the Email Preview modal.
