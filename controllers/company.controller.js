import { Company } from "../models/company.model.js";

//to create a company
export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
        success: false,
      });
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(400).json({
        message: "You cannot register same company",
        success: false,
      });
    }
    company = await Company.create({
      name: companyName,
      userId: req.id,
    });

    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true,
    });
  } catch (error) {
    console.log("Company registration error", error);
  }
};

//to get all the companies that's created by a user
export const getCompany = async (req, res) => {
  try {
    const userId = req.id; // which means the user must be logged in to access the company he created
    const companies = await Company.find({ userId }); // we are finding the company using the logged in user because we only wanna show the list of companies he created rather than all the companies in the database
    if (!companies) {
      return res
        .status(404)
        .json({ message: "Companies not found", success: false });
    }
    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    console.log("Get Company Error", error);
  }
};

//to get a company by id that's created by a user
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found", success: false });
    }
    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.log("Get Company By Id Error", error);
  }
};

//to update a company which already exists
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;

    //for logo ---> through cloudinary
    const file = req.file;

    //updating company details/data
    const updateData = { name, description, website, location };

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company details updated",
      company,
      success: true,
    });
  } catch (error) {
    console.log("Update Company Error", error);
  }
};
