const PRODUCT_TEAMS = [
  "Budgeting",
  "Permitting",
  "Procurement",
  "Asset Management",
  "Financials",
  "Reporting",
  "Platform",
  "Integrations",
  "Other",
];

const PROGRAM_DEFINITIONS = [
  {
    id: "design_partner",
    label: "Design Partner",
    description:
      "Collaborative discovery with a customer to shape product direction before broad availability.",
    expectation:
      "High-touch interviews, workflow walkthroughs, and recurring feedback sessions.",
  },
  {
    id: "private_preview",
    label: "Private Preview",
    description:
      "Early access to near-launch capabilities with controlled rollout and targeted feedback loops.",
    expectation:
      "Regular usage check-ins, bug/fit feedback, and go/no-go readiness signals.",
  },
];

const PARTNERSHIP_STATUSES = [
  "Nominated",
  "Approval In Progress",
  "Active Feedback Loop",
  "Maintenance",
  "Ended",
];

function isoDateFromToday(dayOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

function buildSeedData() {
  return {
    customers: [
      {
        id: "c-1001",
        name: "City of Redwood",
        segment: "Municipality",
        region: "West",
        primaryContact: "Emma Carter",
        contactEmail: "emma.carter@redwood.gov",
      },
      {
        id: "c-1002",
        name: "Riverside County",
        segment: "County",
        region: "West",
        primaryContact: "Luis Alvarez",
        contactEmail: "luis.alvarez@riversidecounty.gov",
      },
      {
        id: "c-1003",
        name: "Town of Bayview",
        segment: "Municipality",
        region: "Midwest",
        primaryContact: "Nina Ford",
        contactEmail: "nina.ford@bayview.gov",
      },
      {
        id: "c-1004",
        name: "City of Pine Hills",
        segment: "Municipality",
        region: "South",
        primaryContact: "Raj Patel",
        contactEmail: "raj.patel@pinehills.gov",
      },
    ],
    nominations: [
      {
        id: "n-2001",
        requestType: "New Partnership",
        customerName: "City of Redwood",
        customerSegment: "Municipality",
        contactName: "Emma Carter",
        contactEmail: "emma.carter@redwood.gov",
        productTeam: "Permitting",
        requestedProgramType: "Design Partner",
        requesterName: "Avery Johnson",
        rationale:
          "Need early workflow validation for contractor licensing and permit review experiences.",
        relationshipGuardrails:
          "Coordinate outreach through assigned CSM and maintain bi-weekly maximum external contact.",
        requestedAt: isoDateFromToday(-8),
        status: "Pending Sign-Off",
        approvals: {
          rd: {
            status: "approved",
            signer: "Morgan Reed",
            signedAt: isoDateFromToday(-7),
            notes: "Strong fit for design collaboration.",
          },
          cs: { status: "pending", signer: "", signedAt: "", notes: "" },
          ps: { status: "pending", signer: "", signedAt: "", notes: "" },
        },
      },
      {
        id: "n-2002",
        requestType: "Document Existing",
        customerName: "Town of Bayview",
        customerSegment: "Municipality",
        contactName: "Nina Ford",
        contactEmail: "nina.ford@bayview.gov",
        productTeam: "Asset Management",
        requestedProgramType: "Private Preview",
        requesterName: "Dylan Kim",
        rationale:
          "Existing preview participant was tracked outside shared systems; needs central visibility.",
        relationshipGuardrails:
          "Align with support owner and avoid adding meetings during budget cycle close.",
        requestedAt: isoDateFromToday(-15),
        status: "Approved - Ready to Activate",
        approvals: {
          rd: {
            status: "approved",
            signer: "Taylor Nguyen",
            signedAt: isoDateFromToday(-13),
            notes: "Feature scope stable.",
          },
          cs: {
            status: "approved",
            signer: "Jordan Lee",
            signedAt: isoDateFromToday(-12),
            notes: "Customer has capacity for scheduled check-ins.",
          },
          ps: {
            status: "approved",
            signer: "Casey Brooks",
            signedAt: isoDateFromToday(-11),
            notes: "Expected implementation lift is manageable.",
          },
        },
      },
      {
        id: "n-2003",
        requestType: "New Partnership",
        customerName: "Riverside County",
        customerSegment: "County",
        contactName: "Luis Alvarez",
        contactEmail: "luis.alvarez@riversidecounty.gov",
        productTeam: "Budgeting",
        requestedProgramType: "Private Preview",
        requesterName: "Harper Singh",
        rationale:
          "Would like input on annual planning templates prior to a larger pilot.",
        relationshipGuardrails:
          "Current engagement load is already high; add only if existing loops are reduced.",
        requestedAt: isoDateFromToday(-6),
        status: "Rejected",
        approvals: {
          rd: {
            status: "approved",
            signer: "Sam Wells",
            signedAt: isoDateFromToday(-6),
            notes: "Conceptually aligned.",
          },
          cs: {
            status: "rejected",
            signer: "Riley Quinn",
            signedAt: isoDateFromToday(-5),
            notes: "Customer currently over-contacted across two other programs.",
          },
          ps: { status: "pending", signer: "", signedAt: "", notes: "" },
        },
      },
    ],
    partnerships: [
      {
        id: "p-3001",
        customerId: "c-1001",
        customerName: "City of Redwood",
        productTeam: "Permitting",
        programType: "Design Partner",
        status: "Active Feedback Loop",
        phaseProgress: 65,
        owner: "Avery Johnson",
        startDate: isoDateFromToday(-30),
        targetEndDate: isoDateFromToday(90),
        endedAt: "",
        endReason: "",
        objective:
          "Validate intake and review workflows for commercial permit requests.",
        feedbackCadence: "Bi-weekly",
        feedbackLoopHealth: "On Track",
        nextFollowUpDate: isoDateFromToday(7),
        lastInteractionAt: isoDateFromToday(-4),
        source: "Nomination",
        nominationId: "n-2001",
        createdAt: isoDateFromToday(-30),
      },
      {
        id: "p-3002",
        customerId: "c-1003",
        customerName: "Town of Bayview",
        productTeam: "Asset Management",
        programType: "Private Preview",
        status: "Maintenance",
        phaseProgress: 85,
        owner: "Dylan Kim",
        startDate: isoDateFromToday(-70),
        targetEndDate: isoDateFromToday(20),
        endedAt: "",
        endReason: "",
        objective:
          "Capture implementation friction and final usability feedback before broad rollout.",
        feedbackCadence: "Monthly",
        feedbackLoopHealth: "Needs Attention",
        nextFollowUpDate: isoDateFromToday(14),
        lastInteractionAt: isoDateFromToday(-12),
        source: "Document Existing",
        nominationId: "n-2002",
        createdAt: isoDateFromToday(-70),
      },
      {
        id: "p-3003",
        customerId: "c-1002",
        customerName: "Riverside County",
        productTeam: "Financials",
        programType: "Private Preview",
        status: "Ended",
        phaseProgress: 100,
        owner: "Mia Thompson",
        startDate: isoDateFromToday(-120),
        targetEndDate: isoDateFromToday(-10),
        endedAt: isoDateFromToday(-8),
        endReason:
          "Preview closed after release criteria met and handoff to standard customer success workflow.",
        objective:
          "Verify reconciliation workflow and close remaining reporting gaps.",
        feedbackCadence: "Bi-weekly",
        feedbackLoopHealth: "Complete",
        nextFollowUpDate: "",
        lastInteractionAt: isoDateFromToday(-10),
        source: "Manual",
        nominationId: "",
        createdAt: isoDateFromToday(-120),
      },
    ],
    interactions: [
      {
        id: "i-4001",
        partnershipId: "p-3001",
        customerName: "City of Redwood",
        productTeam: "Permitting",
        interactionDate: isoDateFromToday(-20),
        channel: "Zoom",
        summary: "Reviewed new permit dashboard prototype with planning director.",
        feedbackSignal: "Positive",
        actionItems: "Revise inspection status labels and reduce navigation depth.",
        owner: "Avery Johnson",
        nextFollowUpDate: isoDateFromToday(-6),
      },
      {
        id: "i-4002",
        partnershipId: "p-3001",
        customerName: "City of Redwood",
        productTeam: "Permitting",
        interactionDate: isoDateFromToday(-4),
        channel: "Email",
        summary:
          "Collected structured comments on permit queue filtering and saved views.",
        feedbackSignal: "Positive",
        actionItems: "Finalize default filter presets before next milestone demo.",
        owner: "Avery Johnson",
        nextFollowUpDate: isoDateFromToday(7),
      },
      {
        id: "i-4003",
        partnershipId: "p-3002",
        customerName: "Town of Bayview",
        productTeam: "Asset Management",
        interactionDate: isoDateFromToday(-25),
        channel: "Onsite",
        summary: "Observed inventory intake workflow with facilities team.",
        feedbackSignal: "Neutral",
        actionItems: "Add batch upload validation feedback for malformed records.",
        owner: "Dylan Kim",
        nextFollowUpDate: isoDateFromToday(-5),
      },
      {
        id: "i-4004",
        partnershipId: "p-3002",
        customerName: "Town of Bayview",
        productTeam: "Asset Management",
        interactionDate: isoDateFromToday(-12),
        channel: "Zoom",
        summary:
          "Maintenance check-in to verify issue resolution and monitor adoption.",
        feedbackSignal: "Needs Support",
        actionItems:
          "Schedule training refresh with support engineer before next monthly check-in.",
        owner: "Dylan Kim",
        nextFollowUpDate: isoDateFromToday(14),
      },
      {
        id: "i-4005",
        partnershipId: "p-3003",
        customerName: "Riverside County",
        productTeam: "Financials",
        interactionDate: isoDateFromToday(-18),
        channel: "Zoom",
        summary:
          "Release readiness review confirmed blocking defects resolved.",
        feedbackSignal: "Positive",
        actionItems: "Prepare final summary and standard handoff notes.",
        owner: "Mia Thompson",
        nextFollowUpDate: isoDateFromToday(-10),
      },
      {
        id: "i-4006",
        partnershipId: "p-3003",
        customerName: "Riverside County",
        productTeam: "Financials",
        interactionDate: isoDateFromToday(-10),
        channel: "Email",
        summary: "Sent closure summary and next-step support contacts.",
        feedbackSignal: "Positive",
        actionItems: "No additional preview interactions planned.",
        owner: "Mia Thompson",
        nextFollowUpDate: "",
      },
    ],
  };
}

module.exports = {
  PRODUCT_TEAMS,
  PROGRAM_DEFINITIONS,
  PARTNERSHIP_STATUSES,
  buildSeedData,
};
