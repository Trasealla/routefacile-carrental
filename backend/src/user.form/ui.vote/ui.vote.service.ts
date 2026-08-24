import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UIVote } from 'src/entities/ui.vote.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UIVoteService extends BaseService<UIVote> {
    constructor(
        @InjectRepository(UIVote) private uiVoteRepository: Repository<UIVote>
    ) {
        super(uiVoteRepository);
    }

    async getVoteSummary() {
        const query = `
            SELECT 
                choice,
                COUNT(*) as count
            FROM ui_votes
            GROUP BY choice
        `;
        return await this.executeRawQuery(query);
    }
}

