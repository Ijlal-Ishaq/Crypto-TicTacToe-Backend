import { Injectable } from '@nestjs/common';
import { create } from 'ipfs-http-client';
import * as Jimp from 'jimp';
@Injectable()
export class AppService {
  async mintNFT(
    gameNo: string,
    winner: string,
    loser: string,
  ): Promise<string> {
    const node = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
    });

    const image = await Jimp.read('NFTTemplate.png');

    if (!image) {
      console.log('error reading image');
      return 'error reading image';
    }

    const dateObj = new Date();
    const month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const date =
      dateObj.getDate() +
      ' ' +
      month[dateObj.getMonth()] +
      ' ' +
      dateObj.getFullYear();

    image.quality(100);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    if (!font) {
      console.log('error loading font');
      return 'error loading font';
    }

    image.print(font, 150, 539, date);
    image.print(font, 625, 539, '#' + gameNo);
    image.print(
      font,
      445,
      735,
      winner.substr(0, 9) + '.....' + winner.substr(33, 42),
    );
    image.print(
      font,
      445,
      840,
      winner.substr(0, 9) + '.....' + loser.substr(33, 42),
    );

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    if (!buffer) {
      console.log('error getting buffer');
      return 'error getting buffer';
    }
    const file = {
      path: 'NFTTT-' + gameNo + '.jpg',
      content: buffer,
    };
    const res = await node.add(file);
    if (!res) {
      console.log('error uploading image');
      return 'error uploading image';
    }
    const URI_Obj = {
      name: 'NFTTT #' + gameNo,
      description: 'Winner ticket of game ' + gameNo,
      image: 'https://ipfs.infura.io/ipfs/' + res.cid.toString(),
    };
    const URI = await node.add(JSON.stringify(URI_Obj));
    console.log('https://ipfs.infura.io/ipfs/' + URI.cid.toString());
    return 'Minted Successfully';
  }
}
