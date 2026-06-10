import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import mailConfig from './mail/config/mail.config';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { HomeModule } from './home/home.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { MilestonesModule } from './milestones/milestones.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectCommentsModule } from './project-comments/project-comments.module';
import { ProjectActivitiesModule } from './project-activities/project-activities.module';
import { InvitationTemplatesModule } from './invitation-templates/invitation-templates.module';
import { TaskCommentsModule } from './task-comments/task-comments.module';
import { ProjectTagsModule } from './project-tags/project-tags.module';
import { CaslAbilityGuard } from './auth/guards/casl-ability.guard';
import { TimeLogsModule } from './time-logs/time-logs.module';

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions | undefined) => {
    if (!options) throw new Error('DataSourceOptions are required');
    return new DataSource(options).initialize();
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    SessionModule,
    MailModule,
    MailerModule,
    AuditLogsModule,
    TeamsModule,
    ProjectsModule,
    MilestonesModule,
    TasksModule,
    CommentsModule,
    NotificationsModule,
    ProjectCommentsModule,
    ProjectActivitiesModule,
    InvitationTemplatesModule,
    TaskCommentsModule,
    ProjectTagsModule,
    TimeLogsModule,
    HomeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CaslAbilityGuard,
    },
  ],
})
export class AppModule {}
