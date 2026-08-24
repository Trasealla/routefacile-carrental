import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { UIVoteService } from './ui.vote.service';
import { UIVoteDto } from './ui.vote.dto';
import { PaginationDto } from 'src/dtos/pagination.dto';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('ui-vote')
@UseGuards(ApiKeyAuthGuard)
@Controller('ui-vote')
export class UIVoteController {

    constructor(
        @Inject(UIVoteService) private uiVoteService: UIVoteService
    ) { }

    @ApiOperation({ summary: 'Submit a vote for website UI preference (first/existing or second/new)' })
    @Post()
    async vote(@Body() body: UIVoteDto) {
        return await this.uiVoteService.insert(body);
    }

    /**
     * Get list of all votes with user details
     * 
     * This endpoint retrieves a paginated list of all UI votes submitted by users.
     * Results are sorted by creation date in descending order (newest first).
     * 
     * @param {PaginationDto} params - Pagination parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.page_size - Number of items per page (default: 10)
     * 
     * @returns {Object} Response object containing:
     * @returns {Array} data - Array of vote objects with:
     *   - id: Vote ID
     *   - username: Voter's name
     *   - phone_number: Voter's phone number
     *   - email: Voter's email address
     *   - choice: Vote choice ('first' or 'second')
     *   - created_at: Vote submission timestamp
     * @returns {number} total_records - Total number of votes in database
     * 
     * @example
     * GET /api/v1/ui-vote?page=1&page_size=10
     * 
     * Response:
     * {
     *   "data": [
     *     {
     *       "id": 1,
     *       "username": "John Doe",
     *       "phone_number": "+971501234567",
     *       "email": "john@example.com",
     *       "choice": "first",
     *       "created_at": "2025-11-28T08:49:13.321Z"
     *     }
     *   ],
     *   "total_records": 1
     * }
     */
    @ApiOperation({ 
        summary: 'Get list of all votes with user details',
        description: 'Retrieves a paginated list of all UI votes. Results are sorted by creation date (newest first). Supports pagination with page and page_size query parameters.'
    })
    @ApiQuery({ 
        name: 'page', 
        required: false, 
        type: Number, 
        description: 'Page number (default: 1)',
        example: 1
    })
    @ApiQuery({ 
        name: 'page_size', 
        required: false, 
        type: Number, 
        description: 'Number of items per page (default: 10)',
        example: 10
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved list of votes',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            username: { type: 'string', example: 'John Doe' },
                            phone_number: { type: 'string', example: '+971501234567' },
                            email: { type: 'string', example: 'john@example.com' },
                            choice: { type: 'string', enum: ['first', 'second'], example: 'first' },
                            created_at: { type: 'string', format: 'date-time', example: '2025-11-28T08:49:13.321Z' }
                        }
                    }
                },
                total_records: { type: 'number', example: 1 }
            }
        }
    })
    @Get()
    async listing(@Query() params: PaginationDto) {
        const select = ['id', 'username', 'phone_number', 'email', 'choice', 'created_at'];
        return await this.uiVoteService.getAll(
            {}, 
            select, 
            {}, 
            null, 
            true, 
            params.page || 1, 
            params.page_size || 10,
            { column: 'entity.created_at', order: 'DESC' }
        );
    }

    /**
     * Get vote summary (count of first vs second choices)
     * 
     * This endpoint retrieves a summary of all votes, showing the count of votes
     * for each choice (first/existing UI vs second/new UI).
     * 
     * Useful for displaying voting statistics and determining which UI design
     * is preferred by users.
     * 
     * @returns {Object} Response object containing:
     * @returns {string} status - Response status ('success')
     * @returns {Array} data - Array of vote count objects with:
     *   - choice: Vote choice ('first' or 'second')
     *   - count: Number of votes for this choice (as string from database)
     * 
     * @example
     * GET /api/v1/ui-vote/summary
     * 
     * Response:
     * {
     *   "status": "success",
     *   "data": [
     *     {
     *       "choice": "first",
     *       "count": "15"
     *     },
     *     {
     *       "choice": "second",
     *       "count": "23"
     *     }
     *   ]
     * }
     * 
     * @example
     * // Calculate total votes
     * const total = data.reduce((sum, item) => sum + parseInt(item.count), 0);
     * 
     * // Get percentage for each choice
     * const firstPercentage = (parseInt(data[0].count) / total) * 100;
     * const secondPercentage = (parseInt(data[1].count) / total) * 100;
     */
    @ApiOperation({ 
        summary: 'Get vote summary (count of first vs second choices)',
        description: 'Retrieves a summary showing the count of votes for each UI choice. Returns the number of votes for "first" (existing UI) and "second" (new UI) options.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved vote summary',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            choice: { type: 'string', enum: ['first', 'second'], example: 'first' },
                            count: { type: 'string', example: '15', description: 'Number of votes as string from database' }
                        }
                    },
                    example: [
                        { choice: 'first', count: '15' },
                        { choice: 'second', count: '23' }
                    ]
                }
            }
        }
    })
    @Get('summary')
    async summary() {
        const data = await this.uiVoteService.getVoteSummary();
        return {
            status: 'success',
            data
        };
    }

    /**
     * Get all votes without pagination
     * 
     * This endpoint retrieves all UI votes submitted by users without any pagination.
     * Results are sorted by creation date in descending order (newest first).
     * 
     * Use this endpoint when you need to fetch all votes at once, such as for
     * exporting data or generating reports.
     * 
     * @returns {Object} Response object containing:
     * @returns {Array} data - Array of all vote objects with:
     *   - id: Vote ID
     *   - username: Voter's name
     *   - phone_number: Voter's phone number
     *   - email: Voter's email address
     *   - choice: Vote choice ('first' or 'second')
     *   - created_at: Vote submission timestamp
     * @returns {number} total_records - Total number of votes in database
     * 
     * @example
     * GET /api/v1/ui-vote/all
     * 
     * Response:
     * {
     *   "data": [
     *     {
     *       "id": 1,
     *       "username": "John Doe",
     *       "phone_number": "+971501234567",
     *       "email": "john@example.com",
     *       "choice": "first",
     *       "created_at": "2025-11-28T08:49:13.321Z"
     *     },
     *     {
     *       "id": 2,
     *       "username": "Jane Smith",
     *       "phone_number": "+971501234568",
     *       "email": "jane@example.com",
     *       "choice": "second",
     *       "created_at": "2025-11-28T09:15:22.456Z"
     *     }
     *   ],
     *   "total_records": 2
     * }
     */
    @ApiOperation({ 
        summary: 'Get all votes without pagination',
        description: 'Retrieves all UI votes without pagination. Results are sorted by creation date (newest first). Use this endpoint when you need to fetch all votes at once.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved all votes',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            username: { type: 'string', example: 'John Doe' },
                            phone_number: { type: 'string', example: '+971501234567' },
                            email: { type: 'string', example: 'john@example.com' },
                            choice: { type: 'string', enum: ['first', 'second'], example: 'first' },
                            created_at: { type: 'string', format: 'date-time', example: '2025-11-28T08:49:13.321Z' }
                        }
                    }
                },
                total_records: { type: 'number', example: 2 }
            }
        }
    })
    @Get('all')
    async getAll() {
        const select = ['id', 'username', 'phone_number', 'email', 'choice', 'created_at'];
        return await this.uiVoteService.getAll(
            {}, 
            select, 
            {}, 
            null, 
            false, 
            1, 
            999999, // Large number to get all records
            { column: 'entity.created_at', order: 'DESC' }
        );
    }
}

