import { Router } from "express";
import { SignUp, SignIn } from "./user_controller.js";

const router = Router();

router.post("/signup", SignUp);
router.post("/signin", SignIn);

export default router;
