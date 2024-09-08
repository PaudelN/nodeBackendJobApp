import express from "express";
import isAuthenticated from "../middlewares/authentication.js";
import {
  getAllJobs,
  getJobById,
  getTotalJobs,
  postJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/createjob").post(isAuthenticated, postJob);
router.route("/getjob").get(isAuthenticated, getAllJobs);
router.route("/getjob/:id").get(isAuthenticated, getJobById);
router.route("/getproviderjobs").get(isAuthenticated, getTotalJobs);

export default router;
