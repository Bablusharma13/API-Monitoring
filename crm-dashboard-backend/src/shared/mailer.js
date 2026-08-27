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

// to: array of email strings, subject: string, text: string, html: string
export const sendAlertEmail = async ({ to, subject, text, html }) => {
  const msResult = await sendEmailNotification({
    uniqueName: "generic-alert",
    project: "API",
    to,
    isDisclaimer: true,
    priority: 2,
    isNote: false,
    subject,
    title: subject,
    text,
    html,
  });

  if (msResult.success) {
    console.log("sendAlertEmail: sent via EMAIL_MS_URL microservice");
    return msResult;
  }

  console.warn(
    "sendAlertEmail: EMAIL_MS_URL failed, falling back to direct SMTP:",
    msResult.message,
  );

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to.join(","),
      subject,
      text,
      html,
    });

    console.log("sendAlertEmail: sent via fallback SMTP transporter");
    return { success: true, message: "Email sent successfully via SMTP fallback" };
  } catch (error) {
    console.error("sendAlertEmail: SMTP fallback failed:", error.message);
    return { success: false, message: error.message || "Email sending failed" };
  }
};
