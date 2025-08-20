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

@Module({
  imports: [UsersModule, AuthModule, ArticlesModule, CommentsModule, ProfilesModule, TagsModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
