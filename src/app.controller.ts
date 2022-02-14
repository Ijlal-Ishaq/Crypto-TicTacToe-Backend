import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/nfttt')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Server Live!';
    // const winner = '0xdB02c2fE3A85f1BdCb34afCF575564A5464660b0';
    // const loser = '0x23e05938b4619035870836D22C4Ef9988623c385';
    // const res: string = await this.appService.mintNFT(winner, loser);
    // return res;
  }

  @Get('sendRequest/:address/:key')
  sendRequest(@Param('address') address, @Param('key') key) {
    return this.appService.sendRequest(address, key);
  }

  @Get('acceptRequest/:address/:key')
  acceptRequest(@Param('address') address, @Param('key') key) {
    return this.appService.acceptRequest(address, key);
  }

  @Get('makeAMove/:gameKey/:key/:position')
  makeAMove(
    @Param('gameKey') gameKey,
    @Param('key') key,
    @Param('position') position,
  ) {
    return this.appService.makeAMove(gameKey, key, position);
  }
}
