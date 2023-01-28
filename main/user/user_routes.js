import { Router } from "express";
import {
  SignUp,
  SignIn,
  handleRefreshToken,
  signOut,
} from "./user_controller.js";

const router = Router();

router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.get("/signout", signOut);
router.get("/refresh", handleRefreshToken);

export default router;
