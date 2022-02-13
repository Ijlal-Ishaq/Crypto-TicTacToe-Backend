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
  goOffline(@Param('address') address, @Param('key') key) {
    return this.appService.sendRequest(address, key);
  }
}
