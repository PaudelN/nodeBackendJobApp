import { Job } from "../models/job.model.js";

//To create a job(for provider)
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all fields", success: false });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      createdBy: userId,
    });
    return res.status(201).json({
      message: "Job posted successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.log("Post Job error", error);
  }
};

//To get all jobs(for seekers)
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({
        createdAt: -1,
      });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", success: false });
    }
    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.log("Get all jobs error", error);
  }
};

//To get job by id(for seekers)
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "No jobs found", success: false });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log("Get job by id error", error);
  }
};

//To get total jobs created by provider
export const getTotalJobs = async (req, res) => {
  try {
    const providerId = req.id;
    const jobs = await Job.find({ createdBy: providerId });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", success: false });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log("Total jobs created by provider error", error);
  }
};
