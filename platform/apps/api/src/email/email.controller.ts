import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@dojo-hub/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { EmailService } from './email.service';
import { SendTestEmailDto } from './dto/send-test.dto';

/**
 * Admin-only diagnostics. Kept in the product because "is email actually working?"
 * is otherwise unanswerable without waiting for a real student to trigger one.
 */
@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /** Reports whether a sending key is configured, without exposing the key itself. */
  @Roles(UserRole.ADMIN)
  @Get('status')
  status() {
    return { configured: this.emailService.isConfigured };
  }

  @Roles(UserRole.ADMIN)
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async test(@Body() dto: SendTestEmailDto) {
    const result = await this.emailService.send({
      to: dto.to,
      subject: 'Dojo Hub Learning Platform email is working',
      block: {
        heading: 'Email is working',
        intro:
          'This is a test message from the Dojo Hub Learning Platform. If you can read it, ' +
          'notifications are configured correctly and students will receive theirs.',
        facts: [
          { label: 'Sent from', value: 'Dojo Hub Learning Platform' },
          { label: 'Time', value: new Date().toUTCString() },
        ],
        ctaLabel: 'Open Dojo Hub Learning Platform',
        ctaUrl: 'https://dojo-hub-web.onrender.com',
        outro: 'No action is needed — this message was sent to confirm delivery.',
      },
    });
    return result;
  }
}
