# 🧾 Loan Application Workflow & Admin Guide

---

## 🚀 **Loan Application Stages**

| Stage | Description |
|-------|-------------|
| 1. Upon Login | "Choose the loan you want to apply for:<br> 1. Salary Earner Cash Loan<br> 2. Business / Corporate Cash Loan<br> 3. Salary Earner Car Loan<br> 4. Business / Corporate Car Loan" |
| 2. Fill the Forms | Applicant fills the necessary form fields |
| 3. Submit | Submit application |
| 4. View Applications | Display a list of loan applications: <br> 1. Loan Application ID <br> 2. Application Date <br> 3. Loan Product <br> 4. Amount <br> 5. Status |

> **📝 Note:** Each stage of the application must be saved persistently.

---

## 📄 Loan Application Forms

### Loan Types & Their Sections

| Section | Salary Earner Cash Loan | Business / Corporate Cash Loan | Salary Earner Car Loan | Business / Corporate Car Loan |
|---------|-------------------------|--------------------------------|-------------------------|-------------------------------|
| **1. Loan Amount / Vehicle Details** | Loan Amount <br> Tenure | Loan Amount <br> Tenure | Make, Model, Year of Vehicle <br> Vehicle Amount <br> Tenure | Make, Model, Year of Vehicle <br> Vehicle Amount <br> Tenure |
| **2. Personal Information** | Selfie <br> First Name <br> Last Name <br> Middle Name <br> Phone Number <br> Email <br> BVN <br> NIN <br> Address (No, Street Name, Nearest Bus Stop, State, Local Government) <br> Home Ownership <br> Years in Current Address <br> Marital Status <br> Highest Level of Education | (Same as left) | (Same as left) | (Same as left) |
| **3. Employment / Business Info** | Employer Name <br> Address <br> Title / Position <br> Work Email <br> Employment Start Date <br> Salary Payment Date <br> Net Salary | Business Name <br> Description of business <br> Industry <br> Business Address <br> Work Email | Same as Salary Earner Cash Loan | Same as Business Cash Loan |
| **4. Next of Kin** | First Name <br> Last Name <br> Middle Name <br> Relationship <br> Phone Number <br> Email Address | Same | Same | Same |
| **5. Salary Bank Account Details** | Bank Name <br> Account Name <br> Account Number | Same | Same | Same |
| **6. Documents** | Valid Government ID <br> Utility Bill <br> Work ID | Valid Government ID <br> Utility Bill <br> Work ID <br> CAC Certificate <br> CAC 2 and 7 or Memart or CAC Application Status | Same as Salary Earner Cash Loan | Same as Business Cash Loan |

---

## 🔐 **Admin Panel Functionality**

| Feature ID | Description |
|------------|-------------|
| 1 | View all applications, download documents, export applications as Excel and PDF |
| 2 | Reject applications with reason and timestamp |
| 3 | Approve & mark applications as disbursed, with timestamp |
| 4 | New applications default to **Pending** |
| 5 | Track who performed each action |
| 6 | Display **Application ID** for all applications |
| 7 | Display **Loan ID** for approved applications |
| 8 | IDs must be 10-character strings generated using **NanoID**:<br> - Must include capital letters, small letters, numbers, and special characters |
| 9 | For any loan status update, log the user who performed the change |

---
