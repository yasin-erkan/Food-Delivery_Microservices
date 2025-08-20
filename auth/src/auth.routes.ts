import express from "express";
import authController from "./auth.controller.ts";
import { authenticate } from "./auth.middleware.ts";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.post("/add-address", authenticate, authController.addAddress);


export default router;