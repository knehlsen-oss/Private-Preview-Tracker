const path = require("path");
const express = require("express");
const { createTrackerStore } = require("./store");

function createApp() {
  const app = express();
  const store = createTrackerStore();

  app.use(express.json({ limit: "1mb" }));
  app.use("/static", express.static(path.join(__dirname, "public")));

  app.get("/", (_req, res) => {
    res.redirect("/tracker");
  });

  app.get("/tracker", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "tracker.html"));
  });

  app.get("/api/tracker/bootstrap", (_req, res) => {
    res.json(store.getSnapshot());
  });

  app.post("/api/nominations", (req, res, next) => {
    try {
      const nomination = store.createNomination(req.body || {});
      res.status(201).json(nomination);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/nominations/:id/signoffs/:role", (req, res, next) => {
    try {
      const nomination = store.signNomination({
        nominationId: req.params.id,
        role: req.params.role,
        status: req.body.status,
        signer: req.body.signer,
        notes: req.body.notes,
        signedAt: req.body.signedAt,
      });
      res.json(nomination);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/partnerships", (req, res, next) => {
    try {
      const partnership = store.createPartnership(req.body || {});
      res.status(201).json(partnership);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/partnerships/:id/status", (req, res, next) => {
    try {
      const partnership = store.updatePartnershipStatus(req.params.id, req.body || {});
      res.json(partnership);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/interactions", (req, res, next) => {
    try {
      const interaction = store.addInteraction(req.body || {});
      res.status(201).json(interaction);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use((error, _req, res, _next) => {
    const statusCode = Number(error.statusCode) || 500;
    const message = statusCode === 500 ? "Unexpected server error." : error.message;
    if (statusCode === 500) {
      console.error(error);
    }
    res.status(statusCode).json({ error: message });
  });

  return app;
}

function startServer() {
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  const host = "localhost";
  app.listen(port, () => {
    const localUrl = `http://${host}:${port}/tracker`;
    console.log("");
    console.log("==============================================");
    console.log("Private Preview & Design Partner Tracker Ready");
    console.log(`Local URL: ${localUrl}`);
    console.log("==============================================");
    console.log("");
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer,
};
