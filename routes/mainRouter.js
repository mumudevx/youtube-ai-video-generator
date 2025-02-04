import express from "express";
import { saveGoogleOAuthCodeToFile } from "../modules/base/inputOutputModule.js";

const router = express.Router();

router.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  if (code) {
    await saveGoogleOAuthCodeToFile(code);
  }

  res.send("OAuth code saved");
});

export default router;
