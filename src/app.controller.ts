import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/NFTTT')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    const winner = '0x23e05938b4619035870836D22C4Ef9988623c385';
    const loser = '0x23e05938b4619035870836D22C4Ef9988623c385';
    const res: string = await this.appService.mintNFT('001', winner, loser);
    return res;
  }
}
