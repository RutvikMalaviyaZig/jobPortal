const cron = require("node-cron");
const User = require('../../models/User')
const JobApplicant = require('../../models/JobApplicant')
const Job = require('../../models/Job')
const sendEmail = require("../mail/sendMail");
const { Op } = require("sequelize");


// cronjob for send message before one day

// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); // get date and add one
        tomorrow.setHours(0, 0, 0, 0);
        const jobsStartingTomorrow = await Job.findAll({  // find in database where startDate is tommorrow
            where: { startDate: { [Op.eq]: tomorrow } },
        });
        for (const job of jobsStartingTomorrow) {
            const selectedApplication = await JobApplicant.findOne({
                where: { jobId: job.id, isAccepted: true },
                include: [
                    {
                      model: Job,
                      required: true,
                    },
                    {
                      model: User,
                      attributes: ["email"],
                    },
                  ],
            });
            if (selectedApplication) {
                const email = selectedApplication.user.dataValues.email;
                const subject = "Job Reminder: Your Job Starts Tomorrow";
                const text = `Hello ${selectedApplication.User.name},\n\nThis is a reminder that your job "${job.title}" starts tomorrow.\n\nStart Time: ${job.startTime}\nEnd Time: ${job.endTime}\n\nBest of luck!\nJob Portal Team`;
                await sendEmail(email, subject, text);  // send mail to perticular user
                // Mark reminder as sent
                
                await selectedApplication.save();
                console.log(`Reminder email sent to ${email} for job ${job.title}`);
            }
        }
    } catch (error) {
        console.error("Error in sending job reminder emails:", error);
    }
});