-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CREATE TABLE "users" (
--     "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
--     "email" VARCHAR(255) UNIQUE NOT NULL,
--     "password" VARCHAR(255) NOT NULL,
--     "stripeCustomerId" VARCHAR DEFAULT '',
--     "createdAt" TIMESTAMP NOT NULL,
--     "updatedAt" TIMESTAMP NOT NULL,
--     "deletedAt" TIMESTAMP
-- );

-- CREATE TABLE "jobs" (
--     "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
--     "title" VARCHAR(255) NOT NULL,
--     "startDate" TIMESTAMP NOT NULL,
--     "endDate" TIMESTAMP NOT NULL,
--     "amountPerHr" INTEGER NOT NULL,
--     "startTime" INTEGER NOT NULL,
--     "endTime" INTEGER NOT NULL,
--     "totalAmount" VARCHAR(255),
--     "jobDescription" TEXT,
--     "isAccepted" BOOLEAN DEFAULT FALSE,
--     "isDeleted" BOOLEAN DEFAULT FALSE,
--     "createdBy" UUID REFERENCES "users" ("id") ON DELETE CASCADE,
--     "createdAt" TIMESTAMP NOT NULL,
--     "updatedAt" TIMESTAMP NOT NULL,
--     "deletedAt" TIMESTAMP
-- );

-- CREATE TABLE "jobApplicant" (
--     "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
--     "userId" UUID REFERENCES "users" ("id") ON DELETE CASCADE,
--     "jobId" UUID REFERENCES "jobs" ("id") ON DELETE CASCADE,
--     "startDate" TIMESTAMP NOT NULL,
--     "endDate" TIMESTAMP NOT NULL,
--     "amountPerHr" VARCHAR(255) NOT NULL,
--     "startTime" INTEGER NOT NULL,
--     "endTime" INTEGER NOT NULL,
--     "totalAmount" VARCHAR(255),
--     "jobStatus" VARCHAR DEFAULT 'pending',
--     "createdAt" TIMESTAMP NOT NULL,
--     "updatedAt" TIMESTAMP NOT NULL,
--     "deletedAt" TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS carddetails (
--   "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   "paymentId" TEXT,
--   "isPaymentDone" BOOLEAN DEFAULT FALSE,
--   "cardId" VARCHAR(255),
--   "cardExpYear" INTEGER,
--   "cardExpMonth" INTEGER,
--   "cardLast4Digit" INTEGER,
--   "createdAt" TIMESTAMP NOT NULL,
--   "updatedAt" TIMESTAMP NOT NULL,
--   "deletedAt" TIMESTAMP
-- );

--- create view  for job lists 

-- CREATE VIEW job_view AS
-- SELECT
--     id,
--     title,
--     "amountPerHr",
--     "totalAmount",
--     "jobDescription",
--     "isAccepted", "createdAt",
--     "updatedAt"
-- FROM jobs
-- WHERE
--     "isDeleted" = false;


-- CREATE VIEW JobApplicantView AS
-- SELECT ja.id AS applicantId, ja."jobId", ja."amountPerHr", ja."totalAmount", ja."jobStatus"
-- FROM "jobApplicant" ja
-- JOIN "jobs" j ON ja."jobId" = j.id;



----- index -----

-- CREATE INDEX job_title ON jobs(title)
-- CREATE INDEX jobid ON "jobApplicant"("jobId")


-------- stored procedure -------

-- CREATE PROCEDURE  check_job_id(IN jobId VARCHAR) 
-- LANGUAGE 'plpgsql'
-- AS $$
-- BEGIN
--     SELECT *
--     FROM jobs
--     WHERE id = jobId AND "isDeleted" = false;
-- END;
-- $$ ;