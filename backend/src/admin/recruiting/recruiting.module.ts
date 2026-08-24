import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { RecruitingDepartment } from 'src/entities/recruiting.department.entity';
import { RecruitingInterview } from 'src/entities/recruiting.interview.entity';
import { RecruitingStatusHistory } from 'src/entities/recruiting.status.history.entity';
import { RecruitingApplicationRating } from 'src/entities/recruiting.application.rating.entity';
import { RecruitingQuestionnaire } from 'src/entities/recruiting.questionnaire.entity';
import { RecruitingScreeningKeyword } from 'src/entities/recruiting.screening.keyword.entity';
import { RecruitingChannelPosting } from 'src/entities/recruiting.channel.posting.entity';
import { CareerJob } from 'src/entities/career.job.entity';
import { CareerJobApplication } from 'src/entities/career.job.applications.entity';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';

// Services
import { RecruitingDepartmentService } from 'src/recruiting/recruiting.department.service';
import { RecruitingInterviewService } from 'src/recruiting/recruiting.interview.service';
import { RecruitingStatusHistoryService } from 'src/recruiting/recruiting.status.history.service';
import { RecruitingApplicationRatingService } from 'src/recruiting/recruiting.application.rating.service';
import { RecruitingQuestionnaireService } from 'src/recruiting/recruiting.questionnaire.service';
import { RecruitingScreeningKeywordService } from 'src/recruiting/recruiting.screening.keyword.service';
import { RecruitingChannelPostingService } from 'src/recruiting/recruiting.channel.posting.service';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { CareerJobService } from 'src/cms/career.job/career.job.service';

// Controllers
import { RecruitingDepartmentController } from './department/department.controller';
import { RecruitingInterviewController } from './interview/interview.controller';
import { RecruitingStatusHistoryController } from './status-history/status-history.controller';
import { RecruitingApplicationRatingController } from './rating/rating.controller';
import { RecruitingManagerDashboardController, RecruitingStaffDashboardController } from './dashboard/dashboard.controller';
import { RecruitingQuestionnaireController } from './questionnaire/questionnaire.controller';
import { RecruitingKeywordController } from './keyword/keyword.controller';
import { RecruitingChannelPostingController } from './channel-posting/channel-posting.controller';
import { CvScreeningService } from './screening/cv.screening.service';
import { CvScreeningController } from './screening/cv.screening.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RecruitingDepartment,
            RecruitingInterview,
            RecruitingStatusHistory,
            RecruitingApplicationRating,
            RecruitingQuestionnaire,
            RecruitingScreeningKeyword,
            RecruitingChannelPosting,
            CareerJob,
            CareerJobApplication,
            CareerJobApplicationAttachment,
        ]),
    ],
    controllers: [
        RecruitingDepartmentController,
        RecruitingInterviewController,
        RecruitingStatusHistoryController,
        RecruitingApplicationRatingController,
        RecruitingQuestionnaireController,
        RecruitingKeywordController,
        RecruitingChannelPostingController,
        RecruitingManagerDashboardController,
        RecruitingStaffDashboardController,
        CvScreeningController,
    ],
    providers: [
        RecruitingDepartmentService,
        RecruitingInterviewService,
        RecruitingStatusHistoryService,
        RecruitingApplicationRatingService,
        RecruitingQuestionnaireService,
        RecruitingScreeningKeywordService,
        RecruitingChannelPostingService,
        CareerJobApplicationService,
        CareerJobService,
        CvScreeningService,
    ],
    exports: [CvScreeningService],
})
export class RecruitingModule { }
