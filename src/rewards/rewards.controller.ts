import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { RewardService } from './reward.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetPayoutHistoryDto, PaginatedPayoutHistoryDto } from './dto/payout-history.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardService: RewardService) {}

  @Get('payouts')
  @UseGuards(JwtAuthGuard)
  async getPayoutHistory(
    @Req() req,
    @Query() query: GetPayoutHistoryDto,
  ): Promise<PaginatedPayoutHistoryDto> {
    return this.rewardService.getRewardHistory(req.user.id, query);
  }
}
