import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

//To create  job application and apply jobs there(for seekers)
export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required",
        success: false,
      });
    }

    //checking if the user already applied for the job or not
    const isApplied = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (isApplied) {
      return res.status(400).json({
        message: "You already applied for this job",
        success: false,
      });
    }

    //check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    //create a new job application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.application.push(newApplication._id);
    await job.save();
    return res.status(201).json({
      message: "Job Applied Successfully",
      success: true,
    });
  } catch (error) {
    console.log("Job Application error", error);
  }
};

//To get the applied jobs by the user(for seekers)
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const appliedJobs = await Application.find({ applicant: userId })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "job",
        options: {
          sort: { createdAt: -1 },
        },
        populate: {
          path: "company",
          options: {
            sort: { createdAt: -1 },
          },
        },
      });
    if (!appliedJobs) {
      return res.status(404).json({
        message: "No jobs applied",
        success: false,
      });
    }
    return res.status(200).json({
      appliedJobs,
      success: true,
    });
  } catch (error) {
    console.log("Getting Applied Job error", error);
  }
};

//To get applicants who applied for the jobs(for provider)
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "application",
      options: {
        sort: { createdAt: -1 },
      },
      populate: {
        path: "applicant",
        options: {
          sort: { createdAt: -1 },
        },
      },
    });
    if (!job) {
      return res.status(404).json({
        message: "No job found",
        success: false,
      });
    }
    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.log("Get Applicants error", error);
  }
};

//application status(selected,pending,rejected)---->[for job seeker]
export const applicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }
    //find the application by applicants id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    //updating status here
    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "Application Status Updated Successfully",
      success: true,
    });
  } catch (error) {
    console.log("Application Status Error", error);
  }
};
