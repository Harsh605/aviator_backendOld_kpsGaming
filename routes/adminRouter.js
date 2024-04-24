import { Router } from "express";
import {
  setReferDetatails,
  getAllBetData,
  getAllUserData,
  getAllWithdrawalRequest,
  acceptWithdraw,
  userSettings,
  getAllRechargeDetails,
  getReferDetails,
  getDashBoardDetails,
  getCurrentRoundBets,
  getAllNormalRechargeDetails,
  acceptRecharge,
} from "../controllers/adminController.js";
import { defaultPagination } from "../utils/defaultPagination.js";
import {
  crashedPlaneSettings,
  getCrashedPlaneSettings,
} from "../controllers/aviatorController.js";
import {
  getPaymentDetails,
  setGatewayKey,
  getTransectionDetails,
  setAdminAccount,
  getAdminBankDetails,
  getGatewayKey,
  setPaymentGateWay,
} from "../controllers/gatewayController.js";
import { uploadBarCode } from "../controllers/multerController.js";
import { changepassword, login } from "../controllers/adminAuthController.js";
const router = Router();

// ==== routes setup =====
router
  .post("/setrefer", setReferDetatails)
  .get("/allbetdata", defaultPagination, getAllBetData)
  .get("/alluserdata", defaultPagination, getAllUserData)
  .get("/allwithdrawalrequest", defaultPagination, getAllWithdrawalRequest)
  .post("/acceptwithdraw", acceptWithdraw)
  .post("/usersettings", userSettings)
  .get("/getallrecharge", defaultPagination, getAllRechargeDetails)
  .post("/crashed", crashedPlaneSettings)
  .get("/getcrashed", getCrashedPlaneSettings)
  .get("/getreferdetails", getReferDetails)
  .get("/dashboard", getDashBoardDetails);

// gatewayController
router
  .get("/getpaymentdetails", getPaymentDetails, getTransectionDetails)
  .post("/setadminaccount", uploadBarCode, setAdminAccount)
  .post("/setgateway", setGatewayKey)
  .get("/getadminbank", getAdminBankDetails)
  .get("/getgatewaykey", getGatewayKey)
  .get("/getcurrentbet", getCurrentRoundBets)
  .post("/setpaymentgateway", setPaymentGateWay)
  .get(
    "/getnormalrechargedetails",
    defaultPagination,
    getAllNormalRechargeDetails
  )
  .post("/acceptrecharge", acceptRecharge);

// login and changepassword
router.post("/login", login).post("/changepassword", changepassword);
export { router };
