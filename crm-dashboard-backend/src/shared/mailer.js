import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmailNotification = async (emailData) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "x-tenant-id": process.env.TENANT_ID,
    };

    // const generalSettings = await getGeneralSettings();
    // const brand_logo_url = generalSettings?.brand?.logo?.url || null;
    // const brand_name = generalSettings?.company?.NAME || null;
    // const header_timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    //    console.log("email data", emailData.data);
    //   console.log("email data full", emailData);

    const payload = {
      uniqueName: emailData.uniqueName,
      project: emailData.project,
      to: emailData.to,
      attachments: emailData.attachments,
      priority: emailData.priority ?? 2,
      data: {
        ...emailData,
        brand_logo_url: "https://backend-auth.enopsy.com/logo.png",
        brand_name: "API Monitoring",
        // header_timestamp,
      },
      subject: emailData.subject,
    };

    const response = await axios.post(`${process.env.EMAIL_MS_URL}`, payload, {
      headers,
      timeout: 10000,
    });

    console.log("Email notification sent successfully:", response.data);
    // return response;
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    if (error.response) {
      console.error("Email API error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Email API no response:", error.message);
    } else {
      console.error("Email API request error:", error.message);
    }
    return { success: false, message: error.message || "Email sending failed" };
  }
};
