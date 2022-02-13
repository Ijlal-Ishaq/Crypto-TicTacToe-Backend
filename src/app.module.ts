import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NFTCountSchema } from './dbModels/NFTCountModel';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    MongooseModule.forFeature([{ name: 'NFTCount', schema: NFTCountSchema }]),
  ],
  controllers: [AppController],
  providers: [AppGateway, AppService],
})
export class AppModule {}
