-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('salary-cash', 'business-cash', 'salary-car', 'business-car');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('pending', 'approved', 'rejected', 'disbursed');

-- CreateEnum
CREATE TYPE "HomeOwnership" AS ENUM ('owned', 'rented', 'family');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'divorced', 'widowed');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('government_id', 'utility_bill', 'work_id', 'cac_certificate', 'cac_documents', 'selfie', 'other');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('email_verification', 'password_reset');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('created', 'approved', 'rejected', 'updated', 'viewed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_applications" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "loan_id" TEXT,
    "user_id" TEXT NOT NULL,
    "loan_type" "LoanType" NOT NULL,
    "status" "AppStatus" NOT NULL DEFAULT 'pending',
    "loan_amount" DECIMAL(65,30),
    "approved_amount" DECIMAL(65,30),
    "interest_rate" DECIMAL(65,30),
    "tenure" INTEGER,
    "approved_tenure" INTEGER,
    "vehicle_make" TEXT,
    "vehicle_model" TEXT,
    "vehicle_year" INTEGER,
    "vehicle_amount" DECIMAL(65,30),
    "middle_name" TEXT,
    "phone_number" TEXT,
    "bvn" TEXT,
    "nin" TEXT,
    "address_number" TEXT,
    "street_name" TEXT,
    "nearest_bus_stop" TEXT,
    "state" TEXT,
    "local_government" TEXT,
    "home_ownership" "HomeOwnership",
    "years_in_address" INTEGER,
    "marital_status" "MaritalStatus",
    "education_level" TEXT,
    "employer_name" TEXT,
    "employer_address" TEXT,
    "job_title" TEXT,
    "work_email" TEXT,
    "employment_start_date" TIMESTAMP(3),
    "salary_payment_date" TEXT,
    "net_salary" DECIMAL(65,30),
    "business_name" TEXT,
    "business_description" TEXT,
    "industry" TEXT,
    "business_address" TEXT,
    "nok_first_name" TEXT,
    "nok_last_name" TEXT,
    "nok_middle_name" TEXT,
    "nok_relationship" TEXT,
    "nok_phone" TEXT,
    "nok_email" TEXT,
    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "approved_by" TEXT,
    "rejected_by" TEXT,
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_application_logs" (
    "id" TEXT NOT NULL,
    "loan_application_id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "performed_by" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_application_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "loan_applications_application_id_key" ON "loan_applications"("application_id");

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_application_logs" ADD CONSTRAINT "loan_application_logs_loan_application_id_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
