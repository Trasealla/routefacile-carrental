import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { RecruitingInterviewService } from 'src/recruiting/recruiting.interview.service';
import { RecruitingDepartmentService } from 'src/recruiting/recruiting.department.service';
import { RecruitingApplicationRatingService } from 'src/recruiting/recruiting.application.rating.service';
import { CareerJobService } from 'src/cms/career.job/career.job.service';

// =============================================
// HR MANAGER DASHBOARD — Full recruiting overview
// =============================================
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager')
@Controller('admin/recruiting/dashboard/manager')
export class RecruitingManagerDashboardController {
    constructor(
        @Inject(CareerJobApplicationService) private applicationService: CareerJobApplicationService,
        @Inject(RecruitingInterviewService) private interviewService: RecruitingInterviewService,
        @Inject(RecruitingDepartmentService) private departmentService: RecruitingDepartmentService,
        @Inject(RecruitingApplicationRatingService) private ratingService: RecruitingApplicationRatingService,
        @Inject(CareerJobService) private jobService: CareerJobService,
    ) { }

    @Get('stats')
    async stats() {
        const appRepo = this.applicationService['repository'];
        const interviewRepo = this.interviewService['repository'];
        const jobRepo = this.jobService['repository'];
        const deptRepo = this.departmentService['repository'];
        const now = new Date().toISOString().slice(0, 10);
        const nowDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Application counts by status
        const statusCounts = await appRepo.createQueryBuilder('entity')
            .select('entity.status', 'status')
            .addSelect('COUNT(entity.id)', 'count')
            .groupBy('entity.status')
            .getRawMany();

        // Total applications
        const totalApplications = await appRepo.createQueryBuilder('entity').getCount();

        // Total active jobs
        const activeJobs = await jobRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 1 })
            .andWhere('entity.expiry_date >= :now', { now })
            .getCount();

        // Total jobs (all)
        const totalJobs = await jobRepo.createQueryBuilder('entity').getCount();

        // Total departments
        const totalDepartments = await deptRepo.createQueryBuilder('entity').getCount();

        // Upcoming interviews (scheduled, in future)
        const upcomingInterviews = await interviewRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 0 })
            .andWhere('entity.interview_date >= :now', { now: nowDatetime })
            .getCount();

        // Recent applications (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentApplications = await appRepo.createQueryBuilder('entity')
            .where('entity.created_at >= :date', { date: sevenDaysAgo.toISOString().slice(0, 19).replace('T', ' ') })
            .getCount();

        // Recent applications (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyApplications = await appRepo.createQueryBuilder('entity')
            .where('entity.created_at >= :date', { date: thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ') })
            .getCount();

        // Hired count (all time)
        const totalHired = await appRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 5 })
            .getCount();

        // Rejected count (all time)
        const totalRejected = await appRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 4 })
            .getCount();

        // Interviews completed
        const completedInterviews = await interviewRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 1 })
            .getCount();

        return {
            total_applications: totalApplications,
            active_jobs: activeJobs,
            total_jobs: totalJobs,
            total_departments: totalDepartments,
            upcoming_interviews: upcomingInterviews,
            completed_interviews: completedInterviews,
            recent_applications_7days: recentApplications,
            recent_applications_30days: monthlyApplications,
            total_hired: totalHired,
            total_rejected: totalRejected,
            applications_by_status: statusCounts,
        };
    }

    @Get('recent-applications')
    async recentApplications() {
        const repo = this.applicationService['repository'];
        const applications = await repo.createQueryBuilder('entity')
            .leftJoin('entity.career_job', 'job_alias')
            .addSelect(['job_alias.id', 'job_alias.title_en', 'job_alias.title_ar'])
            .leftJoin('entity.reviewed_by_admin', 'reviewer_alias')
            .addSelect(['reviewer_alias.id', 'reviewer_alias.first_name', 'reviewer_alias.last_name'])
            .orderBy('entity.created_at', 'DESC')
            .take(10)
            .getMany();

        return { data: applications };
    }

    @Get('upcoming-interviews')
    async upcomingInterviews() {
        const repo = this.interviewService['repository'];
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const interviews = await repo.createQueryBuilder('entity')
            .leftJoin('entity.application', 'application_alias')
            .addSelect(['application_alias.id', 'application_alias.first_name', 'application_alias.last_name', 'application_alias.email'])
            .leftJoin('entity.interviewer', 'interviewer_alias')
            .addSelect(['interviewer_alias.id', 'interviewer_alias.first_name', 'interviewer_alias.last_name'])
            .where('entity.status = :status', { status: 0 })
            .andWhere('entity.interview_date >= :now', { now })
            .orderBy('entity.interview_date', 'ASC')
            .take(10)
            .getMany();

        return { data: interviews };
    }

    @Get('hiring-pipeline')
    async hiringPipeline() {
        const appRepo = this.applicationService['repository'];

        // Applications per job with status breakdown
        const pipeline = await appRepo.createQueryBuilder('entity')
            .leftJoin('entity.career_job', 'job_alias')
            .select('job_alias.id', 'job_id')
            .addSelect('job_alias.title_en', 'job_title_en')
            .addSelect('job_alias.title_ar', 'job_title_ar')
            .addSelect('entity.status', 'status')
            .addSelect('COUNT(entity.id)', 'count')
            .groupBy('job_alias.id')
            .addGroupBy('job_alias.title_en')
            .addGroupBy('job_alias.title_ar')
            .addGroupBy('entity.status')
            .orderBy('job_alias.id', 'ASC')
            .getRawMany();

        // Group by job
        const jobs: Record<number, any> = {};
        for (const row of pipeline) {
            if (!row.job_id) continue;
            if (!jobs[row.job_id]) {
                jobs[row.job_id] = {
                    job_id: row.job_id,
                    job_title_en: row.job_title_en,
                    job_title_ar: row.job_title_ar,
                    pending: 0,
                    reviewing: 0,
                    shortlisted: 0,
                    interviewed: 0,
                    rejected: 0,
                    hired: 0,
                    total: 0,
                };
            }
            const count = parseInt(row.count);
            jobs[row.job_id].total += count;
            switch (parseInt(row.status)) {
                case 0: jobs[row.job_id].pending = count; break;
                case 1: jobs[row.job_id].reviewing = count; break;
                case 2: jobs[row.job_id].shortlisted = count; break;
                case 3: jobs[row.job_id].interviewed = count; break;
                case 4: jobs[row.job_id].rejected = count; break;
                case 5: jobs[row.job_id].hired = count; break;
            }
        }

        return { data: Object.values(jobs) };
    }

    @Get('application-trends')
    async applicationTrends() {
        const appRepo = this.applicationService['repository'];

        // Applications per day for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trends = await appRepo.createQueryBuilder('entity')
            .select('DATE(entity.created_at)', 'date')
            .addSelect('COUNT(entity.id)', 'count')
            .where('entity.created_at >= :date', { date: thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ') })
            .groupBy('DATE(entity.created_at)')
            .orderBy('DATE(entity.created_at)', 'ASC')
            .getRawMany();

        return { data: trends };
    }

    @Get('interview-stats')
    async interviewStats() {
        const interviewRepo = this.interviewService['repository'];

        // Interview counts by status
        const statusCounts = await interviewRepo.createQueryBuilder('entity')
            .select('entity.status', 'status')
            .addSelect('COUNT(entity.id)', 'count')
            .groupBy('entity.status')
            .getRawMany();

        // Average interview rating (completed interviews with rating)
        const avgRating = await interviewRepo.createQueryBuilder('entity')
            .select('AVG(entity.rating)', 'average_rating')
            .addSelect('COUNT(entity.id)', 'rated_count')
            .where('entity.rating IS NOT NULL')
            .getRawOne();

        // Interviews per interviewer
        const perInterviewer = await interviewRepo.createQueryBuilder('entity')
            .leftJoin('entity.interviewer', 'interviewer_alias')
            .select('interviewer_alias.id', 'interviewer_id')
            .addSelect('interviewer_alias.first_name', 'first_name')
            .addSelect('interviewer_alias.last_name', 'last_name')
            .addSelect('COUNT(entity.id)', 'total_interviews')
            .addSelect('SUM(CASE WHEN entity.status = 1 THEN 1 ELSE 0 END)', 'completed')
            .addSelect('SUM(CASE WHEN entity.status = 0 THEN 1 ELSE 0 END)', 'scheduled')
            .groupBy('interviewer_alias.id')
            .addGroupBy('interviewer_alias.first_name')
            .addGroupBy('interviewer_alias.last_name')
            .orderBy('total_interviews', 'DESC')
            .getRawMany();

        return {
            interviews_by_status: statusCounts,
            average_interview_rating: avgRating.average_rating ? parseFloat(avgRating.average_rating).toFixed(1) : null,
            rated_interviews_count: parseInt(avgRating.rated_count),
            interviews_per_interviewer: perInterviewer,
        };
    }

    @Get('top-rated-applications')
    async topRatedApplications() {
        const ratingRepo = this.ratingService['repository'];

        const topRated = await ratingRepo.createQueryBuilder('entity')
            .leftJoin('entity.application', 'application_alias')
            .select('application_alias.id', 'application_id')
            .addSelect('application_alias.first_name', 'first_name')
            .addSelect('application_alias.last_name', 'last_name')
            .addSelect('application_alias.email', 'email')
            .addSelect('application_alias.status', 'application_status')
            .addSelect('AVG(entity.rating)', 'average_rating')
            .addSelect('COUNT(entity.id)', 'total_ratings')
            .groupBy('application_alias.id')
            .addGroupBy('application_alias.first_name')
            .addGroupBy('application_alias.last_name')
            .addGroupBy('application_alias.email')
            .addGroupBy('application_alias.status')
            .orderBy('average_rating', 'DESC')
            .take(10)
            .getRawMany();

        return {
            data: topRated.map(r => ({
                ...r,
                average_rating: parseFloat(r.average_rating).toFixed(1),
                total_ratings: parseInt(r.total_ratings),
            })),
        };
    }
}

// =============================================
// STAFF DASHBOARD — Limited view for all staff
// =============================================
@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'counter', 'accounts', 'hr_recruitment', 'hr_manager')
@Controller('admin/recruiting/dashboard/staff')
export class RecruitingStaffDashboardController {
    constructor(
        @Inject(CareerJobApplicationService) private applicationService: CareerJobApplicationService,
        @Inject(RecruitingInterviewService) private interviewService: RecruitingInterviewService,
        @Inject(RecruitingApplicationRatingService) private ratingService: RecruitingApplicationRatingService,
        @Inject(CareerJobService) private jobService: CareerJobService,
    ) { }

    @Get('stats')
    async stats(@Request() req) {
        const adminId = req.user.id;
        const appRepo = this.applicationService['repository'];
        const interviewRepo = this.interviewService['repository'];
        const jobRepo = this.jobService['repository'];
        const now = new Date().toISOString().slice(0, 10);
        const nowDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Active job openings
        const activeJobs = await jobRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 1 })
            .andWhere('entity.expiry_date >= :now', { now })
            .getCount();

        // Total pending applications
        const pendingApplications = await appRepo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 0 })
            .getCount();

        // My upcoming interviews (where I am the interviewer)
        const myUpcomingInterviews = await interviewRepo.createQueryBuilder('entity')
            .where('entity.interviewer_id = :adminId', { adminId })
            .andWhere('entity.status = :status', { status: 0 })
            .andWhere('entity.interview_date >= :now', { now: nowDatetime })
            .getCount();

        // My completed interviews
        const myCompletedInterviews = await interviewRepo.createQueryBuilder('entity')
            .where('entity.interviewer_id = :adminId', { adminId })
            .andWhere('entity.status = :status', { status: 1 })
            .getCount();

        // My total ratings given
        const ratingRepo = this.ratingService['repository'];
        const myRatingsGiven = await ratingRepo.createQueryBuilder('entity')
            .where('entity.rated_by = :adminId', { adminId })
            .getCount();

        return {
            active_jobs: activeJobs,
            pending_applications: pendingApplications,
            my_upcoming_interviews: myUpcomingInterviews,
            my_completed_interviews: myCompletedInterviews,
            my_ratings_given: myRatingsGiven,
        };
    }

    @Get('my-interviews')
    async myInterviews(@Request() req) {
        const adminId = req.user.id;
        const repo = this.interviewService['repository'];
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const interviews = await repo.createQueryBuilder('entity')
            .leftJoin('entity.application', 'application_alias')
            .addSelect(['application_alias.id', 'application_alias.first_name', 'application_alias.last_name', 'application_alias.email'])
            .where('entity.interviewer_id = :adminId', { adminId })
            .andWhere('entity.status = :status', { status: 0 })
            .andWhere('entity.interview_date >= :now', { now })
            .orderBy('entity.interview_date', 'ASC')
            .take(20)
            .getMany();

        return { data: interviews };
    }

    @Get('my-recent-interviews')
    async myRecentInterviews(@Request() req) {
        const adminId = req.user.id;
        const repo = this.interviewService['repository'];

        const interviews = await repo.createQueryBuilder('entity')
            .leftJoin('entity.application', 'application_alias')
            .addSelect(['application_alias.id', 'application_alias.first_name', 'application_alias.last_name', 'application_alias.email'])
            .where('entity.interviewer_id = :adminId', { adminId })
            .andWhere('entity.status = :status', { status: 1 })
            .orderBy('entity.created_at', 'DESC')
            .take(10)
            .getMany();

        return { data: interviews };
    }

    @Get('open-positions')
    async openPositions() {
        const repo = this.jobService['repository'];
        const now = new Date().toISOString().slice(0, 10);

        const jobs = await repo.createQueryBuilder('entity')
            .where('entity.status = :status', { status: 1 })
            .andWhere('entity.expiry_date >= :now', { now })
            .orderBy('entity.created_at', 'DESC')
            .getMany();

        return { data: jobs };
    }

    @Get('my-ratings')
    async myRatings(@Request() req) {
        const adminId = req.user.id;
        const ratingRepo = this.ratingService['repository'];

        const ratings = await ratingRepo.createQueryBuilder('entity')
            .leftJoin('entity.application', 'application_alias')
            .addSelect(['application_alias.id', 'application_alias.first_name', 'application_alias.last_name', 'application_alias.email'])
            .where('entity.rated_by = :adminId', { adminId })
            .orderBy('entity.created_at', 'DESC')
            .take(20)
            .getMany();

        return { data: ratings };
    }
}
