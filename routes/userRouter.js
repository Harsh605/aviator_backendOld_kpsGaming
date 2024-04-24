import { Router } from "express";

import {
  getUserInfo,
  protect,
  withDraw,
  transferMoney,
  getMinimumWithDrawal,
  getUserBets,
  getAllBets,
  normalRecharge,
} from "../controllers/userController.js";
import { deleteAllBets } from "../controllers/aviatorController.js";
import { doPayment } from "../controllers/gatewayController.js";
import { uploadTransectionScreenshot } from "../controllers/multerController.js";
const router = Router();

// ==== routes setup =====
router
  .get("/getUserInfo", protect, getUserInfo)
  .post("/withdraw", withDraw)
  .post("/transfer", transferMoney)
  .get("/minwl", getMinimumWithDrawal)
  .get("/getmybets", getUserBets)
  .get("/getallbets", getAllBets)
  .delete("/deleteallbets", deleteAllBets);

router
  .post("/proxy/create_order", doPayment)
  .post("/deposit", uploadTransectionScreenshot, normalRecharge);
export { router };
