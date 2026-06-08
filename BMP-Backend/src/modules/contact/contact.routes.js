import express from "express";
import { submitContact } from "./contact.controller.js";

const router = express.Router();

// POST /api/v1/contact
router.post("/", submitContact);

export default router;
