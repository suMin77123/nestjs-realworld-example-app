import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { CommentsModule } from './comments/comments.module';
import { ProfilesModule } from './profiles/profiles.module';
import { TagsModule } from './tags/tags.module';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ArticlesModule,
    CommentsModule,
    ProfilesModule,
    TagsModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
