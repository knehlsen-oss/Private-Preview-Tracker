const {
  PRODUCT_TEAMS,
  PROGRAM_DEFINITIONS,
  PARTNERSHIP_STATUSES,
  buildSeedData,
} = require("./seedData");

const APPROVAL_ROLES = ["rd", "cs", "ps"];
const PROGRAM_TYPES = PROGRAM_DEFINITIONS.map((definition) => definition.label);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function coerceText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function coerceDate(value, fallback = todayIso()) {
  const text = coerceText(value);
  if (!text) {
    return fallback;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw createError(400, `Expected date in YYYY-MM-DD format, received "${text}".`);
  }
  return text;
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function nextCounterForPrefix(items, prefix) {
  const maxId = items.reduce((max, item) => {
    const id = String(item.id || "");
    const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[1]));
  }, 0);
  return maxId + 1;
}

function formatId(prefix, counter) {
  return `${prefix}-${String(counter).padStart(4, "0")}`;
}

function compareByDateDesc(a, b, key) {
  const left = String(a[key] || "");
  const right = String(b[key] || "");
  return right.localeCompare(left);
}

function partnershipProgress(status) {
  switch (status) {
    case "Nominated":
      return 20;
    case "Approval In Progress":
      return 40;
    case "Active Feedback Loop":
      return 65;
    case "Maintenance":
      return 85;
    case "Ended":
      return 100;
    default:
      return 0;
  }
}

function deriveNominationStatus(approvals) {
  const states = APPROVAL_ROLES.map((role) => approvals[role].status);
  if (states.includes("rejected")) {
    return "Rejected";
  }
  if (states.every((state) => state === "approved")) {
    return "Approved - Ready to Activate";
  }
  return "Pending Sign-Off";
}

function createTrackerStore(seed = buildSeedData()) {
  const state = clone(seed);

  const counters = {
    c: nextCounterForPrefix(state.customers, "c"),
    n: nextCounterForPrefix(state.nominations, "n"),
    p: nextCounterForPrefix(state.partnerships, "p"),
    i: nextCounterForPrefix(state.interactions, "i"),
  };

  function upsertCustomer(fields) {
    const customerName = coerceText(fields.name || fields.customerName);
    if (!customerName) {
      throw createError(400, "Customer name is required.");
    }

    const existing = state.customers.find(
      (customer) => customer.name.toLowerCase() === customerName.toLowerCase(),
    );

    if (existing) {
      existing.segment = coerceText(fields.segment || fields.customerSegment) || existing.segment;
      existing.primaryContact = coerceText(fields.primaryContact || fields.contactName) || existing.primaryContact;
      existing.contactEmail = coerceText(fields.contactEmail) || existing.contactEmail;
      return existing;
    }

    const customer = {
      id: formatId("c", counters.c++),
      name: customerName,
      segment: coerceText(fields.segment || fields.customerSegment) || "Municipality",
      region: coerceText(fields.region) || "Unspecified",
      primaryContact: coerceText(fields.primaryContact || fields.contactName) || "Unassigned",
      contactEmail: coerceText(fields.contactEmail) || "",
    };

    state.customers.push(customer);
    return customer;
  }

  function listCustomersWithLoad() {
    const interactionByCustomer = new Map();
    for (const interaction of state.interactions) {
      const key = interaction.customerName.toLowerCase();
      const previous = interactionByCustomer.get(key);
      if (!previous || previous.localeCompare(interaction.interactionDate) < 0) {
        interactionByCustomer.set(key, interaction.interactionDate);
      }
    }

    return state.customers
      .map((customer) => {
        const activePartnerships = state.partnerships.filter(
          (partnership) =>
            partnership.customerName.toLowerCase() === customer.name.toLowerCase() &&
            partnership.status !== "Ended",
        );
        const pendingNominations = state.nominations.filter(
          (nomination) =>
            nomination.customerName.toLowerCase() === customer.name.toLowerCase() &&
            (nomination.status === "Pending Sign-Off" ||
              nomination.status === "Approved - Ready to Activate"),
        );

        const engagementLoad = activePartnerships.length + pendingNominations.length;
        let relationshipRisk = "Low";
        if (engagementLoad >= 3) {
          relationshipRisk = "High";
        } else if (engagementLoad >= 2) {
          relationshipRisk = "Medium";
        }

        return {
          ...customer,
          activePartnershipCount: activePartnerships.length,
          pendingNominationCount: pendingNominations.length,
          engagementLoad,
          relationshipRisk,
          overContactRisk: engagementLoad >= 2,
          activePrograms: activePartnerships.map((partnership) => partnership.programType),
          lastInteractionAt: interactionByCustomer.get(customer.name.toLowerCase()) || "",
        };
      })
      .sort((a, b) => b.engagementLoad - a.engagementLoad || a.name.localeCompare(b.name));
  }

  function buildDashboard() {
    const activePartnerships = state.partnerships.filter(
      (partnership) => partnership.status === "Active Feedback Loop",
    );
    const maintenancePartnerships = state.partnerships.filter(
      (partnership) => partnership.status === "Maintenance",
    );
    const endedPartnerships = state.partnerships.filter(
      (partnership) => partnership.status === "Ended",
    );
    const pendingNominations = state.nominations.filter(
      (nomination) => nomination.status === "Pending Sign-Off",
    );
    const readyToActivate = state.nominations.filter(
      (nomination) => nomination.status === "Approved - Ready to Activate",
    );
    const rejectedNominations = state.nominations.filter(
      (nomination) => nomination.status === "Rejected",
    );

    const interactionWindowStart = new Date();
    interactionWindowStart.setDate(interactionWindowStart.getDate() - 30);
    const interactionsPast30Days = state.interactions.filter((interaction) => {
      return new Date(interaction.interactionDate) >= interactionWindowStart;
    }).length;

    const customersWithLoad = listCustomersWithLoad();

    return {
      totalCustomers: state.customers.length,
      activeFeedbackLoops: activePartnerships.length,
      maintenanceLoops: maintenancePartnerships.length,
      endedPartnerships: endedPartnerships.length,
      pendingNominations: pendingNominations.length,
      readyToActivate: readyToActivate.length,
      rejectedNominations: rejectedNominations.length,
      interactionsPast30Days,
      customersAtOverContactRisk: customersWithLoad.filter((customer) => customer.overContactRisk)
        .length,
    };
  }

  function validateTeam(productTeam) {
    if (!PRODUCT_TEAMS.includes(productTeam)) {
      throw createError(400, `Unknown product team "${productTeam}".`);
    }
  }

  function validateProgramType(programType) {
    if (!PROGRAM_TYPES.includes(programType)) {
      throw createError(400, `Unknown program type "${programType}".`);
    }
  }

  function createNomination(payload) {
    const customerName = coerceText(payload.customerName);
    const productTeam = coerceText(payload.productTeam);
    const requestedProgramType = coerceText(payload.requestedProgramType);
    const requesterName = coerceText(payload.requesterName);
    const rationale = coerceText(payload.rationale);

    if (!customerName || !productTeam || !requestedProgramType || !requesterName || !rationale) {
      throw createError(
        400,
        "Required fields for nomination: customerName, productTeam, requestedProgramType, requesterName, rationale.",
      );
    }

    validateTeam(productTeam);
    validateProgramType(requestedProgramType);
    const customer = upsertCustomer({
      customerName,
      customerSegment: payload.customerSegment,
      contactName: payload.contactName,
      contactEmail: payload.contactEmail,
    });

    const nomination = {
      id: formatId("n", counters.n++),
      requestType: coerceText(payload.requestType) || "New Partnership",
      customerName,
      customerSegment: coerceText(payload.customerSegment) || customer.segment,
      contactName: coerceText(payload.contactName) || customer.primaryContact,
      contactEmail: coerceText(payload.contactEmail) || customer.contactEmail,
      productTeam,
      requestedProgramType,
      requesterName,
      rationale,
      relationshipGuardrails: coerceText(payload.relationshipGuardrails),
      requestedAt: coerceDate(payload.requestedAt),
      status: "Pending Sign-Off",
      approvals: {
        rd: { status: "pending", signer: "", signedAt: "", notes: "" },
        cs: { status: "pending", signer: "", signedAt: "", notes: "" },
        ps: { status: "pending", signer: "", signedAt: "", notes: "" },
      },
      linkedPartnershipId: "",
    };

    state.nominations.push(nomination);
    return clone(nomination);
  }

  function signNomination({ nominationId, role, status, signer, notes, signedAt }) {
    if (!APPROVAL_ROLES.includes(role)) {
      throw createError(400, `Invalid approval role "${role}".`);
    }
    if (status !== "approved" && status !== "rejected") {
      throw createError(400, "Sign-off status must be either approved or rejected.");
    }

    const nomination = state.nominations.find((item) => item.id === nominationId);
    if (!nomination) {
      throw createError(404, `Nomination ${nominationId} not found.`);
    }

    nomination.approvals[role] = {
      status,
      signer: coerceText(signer) || "Unknown",
      signedAt: coerceDate(signedAt),
      notes: coerceText(notes),
    };
    nomination.status = deriveNominationStatus(nomination.approvals);
    return clone(nomination);
  }

  function createPartnership(payload) {
    const customerName = coerceText(payload.customerName);
    const productTeam = coerceText(payload.productTeam);
    const programType = coerceText(payload.programType);
    const owner = coerceText(payload.owner);
    const objective = coerceText(payload.objective);

    if (!customerName || !productTeam || !programType || !owner || !objective) {
      throw createError(
        400,
        "Required fields for partnership: customerName, productTeam, programType, owner, objective.",
      );
    }
    validateTeam(productTeam);
    validateProgramType(programType);

    const nominationId = coerceText(payload.nominationId);
    if (nominationId) {
      const nomination = state.nominations.find((item) => item.id === nominationId);
      if (!nomination) {
        throw createError(404, `Nomination ${nominationId} not found.`);
      }
      if (nomination.status !== "Approved - Ready to Activate") {
        throw createError(
          400,
          `Nomination ${nominationId} is not ready to activate (status: ${nomination.status}).`,
        );
      }
    }

    const status = coerceText(payload.status) || "Active Feedback Loop";
    if (!PARTNERSHIP_STATUSES.includes(status)) {
      throw createError(400, `Unknown partnership status "${status}".`);
    }

    const customer = upsertCustomer({
      customerName,
      customerSegment: payload.customerSegment,
      contactName: payload.contactName,
      contactEmail: payload.contactEmail,
    });

    const partnership = {
      id: formatId("p", counters.p++),
      customerId: customer.id,
      customerName: customer.name,
      productTeam,
      programType,
      status,
      phaseProgress: partnershipProgress(status),
      owner,
      startDate: coerceDate(payload.startDate),
      targetEndDate: coerceDate(payload.targetEndDate, ""),
      endedAt: status === "Ended" ? coerceDate(payload.endedAt) : "",
      endReason: status === "Ended" ? coerceText(payload.endReason) || "Not specified." : "",
      objective,
      feedbackCadence: coerceText(payload.feedbackCadence) || "Bi-weekly",
      feedbackLoopHealth: coerceText(payload.feedbackLoopHealth) || "On Track",
      nextFollowUpDate: coerceDate(payload.nextFollowUpDate, ""),
      lastInteractionAt: coerceDate(payload.lastInteractionAt, ""),
      source: coerceText(payload.source) || (nominationId ? "Nomination" : "Manual"),
      nominationId,
      createdAt: todayIso(),
    };

    state.partnerships.push(partnership);

    if (nominationId) {
      const nomination = state.nominations.find((item) => item.id === nominationId);
      nomination.status = "Converted to Partnership";
      nomination.linkedPartnershipId = partnership.id;
    }

    return clone(partnership);
  }

  function updatePartnershipStatus(partnershipId, payload) {
    const partnership = state.partnerships.find((item) => item.id === partnershipId);
    if (!partnership) {
      throw createError(404, `Partnership ${partnershipId} not found.`);
    }

    const status = coerceText(payload.status);
    if (status) {
      if (!PARTNERSHIP_STATUSES.includes(status)) {
        throw createError(400, `Unknown partnership status "${status}".`);
      }
      partnership.status = status;
      partnership.phaseProgress = partnershipProgress(status);
    }

    const nextFollowUpDate = coerceText(payload.nextFollowUpDate);
    if (nextFollowUpDate) {
      partnership.nextFollowUpDate = coerceDate(nextFollowUpDate, "");
    }

    const targetEndDate = coerceText(payload.targetEndDate);
    if (targetEndDate) {
      partnership.targetEndDate = coerceDate(targetEndDate, "");
    }

    const feedbackLoopHealth = coerceText(payload.feedbackLoopHealth);
    if (feedbackLoopHealth) {
      partnership.feedbackLoopHealth = feedbackLoopHealth;
    }

    if (partnership.status === "Ended") {
      partnership.endedAt = coerceDate(payload.endedAt || partnership.endedAt);
      partnership.endReason = coerceText(payload.endReason || partnership.endReason) || "Not specified.";
    } else if (status && status !== "Ended") {
      partnership.endedAt = "";
      partnership.endReason = "";
    }

    return clone(partnership);
  }

  function addInteraction(payload) {
    const partnershipId = coerceText(payload.partnershipId);
    const summary = coerceText(payload.summary);
    const owner = coerceText(payload.owner);

    if (!partnershipId || !summary || !owner) {
      throw createError(400, "Required fields for interaction: partnershipId, summary, owner.");
    }

    const partnership = state.partnerships.find((item) => item.id === partnershipId);
    if (!partnership) {
      throw createError(404, `Partnership ${partnershipId} not found.`);
    }

    const interactionDate = coerceDate(payload.interactionDate);
    const interaction = {
      id: formatId("i", counters.i++),
      partnershipId,
      customerName: partnership.customerName,
      productTeam: partnership.productTeam,
      interactionDate,
      channel: coerceText(payload.channel) || "Email",
      summary,
      feedbackSignal: coerceText(payload.feedbackSignal) || "Neutral",
      actionItems: coerceText(payload.actionItems),
      owner,
      nextFollowUpDate: coerceDate(payload.nextFollowUpDate, ""),
    };

    state.interactions.push(interaction);
    partnership.lastInteractionAt = interactionDate;
    if (interaction.nextFollowUpDate) {
      partnership.nextFollowUpDate = interaction.nextFollowUpDate;
    }
    if (interaction.feedbackSignal === "Needs Support") {
      partnership.feedbackLoopHealth = "Needs Attention";
    }
    if (
      partnership.status === "Nominated" ||
      partnership.status === "Approval In Progress"
    ) {
      partnership.status = "Active Feedback Loop";
      partnership.phaseProgress = partnershipProgress(partnership.status);
    }

    return clone(interaction);
  }

  function getSnapshot() {
    return {
      productTeams: clone(PRODUCT_TEAMS),
      programDefinitions: clone(PROGRAM_DEFINITIONS),
      partnershipStatuses: clone(PARTNERSHIP_STATUSES),
      customers: listCustomersWithLoad(),
      nominations: clone(state.nominations).sort((a, b) => compareByDateDesc(a, b, "requestedAt")),
      partnerships: clone(state.partnerships).sort((a, b) =>
        a.customerName.localeCompare(b.customerName),
      ),
      interactions: clone(state.interactions).sort((a, b) =>
        compareByDateDesc(a, b, "interactionDate"),
      ),
      dashboard: buildDashboard(),
    };
  }

  return {
    getSnapshot,
    createNomination,
    signNomination,
    createPartnership,
    updatePartnershipStatus,
    addInteraction,
  };
}

module.exports = {
  APPROVAL_ROLES,
  PROGRAM_TYPES,
  createTrackerStore,
};
