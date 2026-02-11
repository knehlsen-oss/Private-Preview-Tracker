# Private Preview & Design Partner Tracker

Internal tracker for selecting, approving, running, and closing customer partnerships across OpenGov product teams.

## What this tool provides

- Single source of truth for:
  - **Design Partner** programs
  - **Private Preview** programs
- A **Customer Nomination and Approval flow** with required sign-offs from:
  - R&D
  - CS
  - PS
- Dedicated space for every product team to:
  - Request a new partnership
  - Document an existing partnership
- Interaction logging with feedback-loop visibility:
  - Progress through lifecycle stages
  - Maintenance tracking
  - Partnership end date and reason
- Customer engagement load monitoring to reduce over-contact risk.

## Routes

- `/tracker` -> tracker landing page
- `/api/tracker/bootstrap` -> full seeded snapshot for UI
- `/api/nominations` -> create nominations
- `/api/nominations/:id/signoffs/:role` -> record R&D/CS/PS sign-offs
- `/api/partnerships` -> create/activate partnerships
- `/api/partnerships/:id/status` -> update lifecycle status (including ended)
- `/api/interactions` -> add customer interaction entries

## Run locally

```bash
npm install
npm start
```

The startup log prints the local URL clearly:

`http://localhost:3000/tracker`

## Seeded test data

The server seeds realistic example records automatically at startup:

- Customers
- Nominations
- Approvals
- Partnerships
- Interactions

This allows immediate testing without manual setup.
