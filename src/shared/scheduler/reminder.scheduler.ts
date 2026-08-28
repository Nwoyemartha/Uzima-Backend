import {
  Injectable,
  Logger,
} from "@nestjs/common";

import {
  Cron,
  CronExpression,
} from "@nestjs/schedule";

import { CouponService }
  from "../../coupons/coupon.service";

import { TasksService }
  from "../../tasks/tasks.service";

import { NotificationService }
  from "../../notifications/services/notification.service";

@Injectable()
export class ReminderScheduler {

  private readonly logger =
    new Logger(
      ReminderScheduler.name,
    );

  constructor(
    private readonly couponService: CouponService,

    private readonly taskService: TasksService,

    private readonly notificationService:
      NotificationService,
  ) {}

  /**
   * Runs hourly to identify
   * coupons expiring within
   * the next 24 hours.
   */
  @Cron(
    CronExpression.EVERY_HOUR,
  )
  async sendCouponExpiryReminders() {

    const allCoupons =
      await this.couponService.getActiveForUser('*');
    const now = new Date();
    const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const coupons = allCoupons.filter(c => c.expiresAt <= cutoff);

    for (const coupon of coupons) {

      await (this.notificationService as any).sendCouponExpiryReminder?.(
        {
          userId:
            coupon.userId,

          couponId:
            coupon.id,

          expiresAt:
            coupon.expiresAt,

          code:
            coupon.code,
        },
      );
    }

    this.logger.log(
      `Processed ${coupons.length} coupon reminders`,
    );
  }

  /**
   * Daily digest
   * at 08:00 server time.
   */
  @Cron(
    "0 8 * * *",
  )
  async sendPendingTaskDigest() {

    const users = [{ id: 'all' }];

    for (const user of users) {

      const tasks =
        await this.taskService.search('');

      if (
        tasks.length === 0
      ) {
        continue;
      }

      await (this.notificationService as any).sendPendingTaskDigest?.(
        {
          userId:
            user.id,

          tasks,
        },
      );
    }

    this.logger.log(
      `Processed ${users.length} task digests`,
    );
  }
}