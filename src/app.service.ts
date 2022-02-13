/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { create } from 'ipfs-http-client';
import * as Jimp from 'jimp';
import { ABI } from './utils/ABI';
import { NFTCount } from './dbModels/NFTCountModel';
import * as admin from 'firebase-admin';
const Provider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const uuid = require('uuid');

@Injectable()
export class AppService {
  constructor(
    @InjectModel('NFTCount') private readonly NFTCount: Model<NFTCount>,
  ) {}
  async mintNFT(winner: string, loser: string): Promise<string> {
    // *****************************************************************
    // *****************************************************************
    // *****************************************************************
    // generating token

    const count = await this.NFTCount.findByIdAndUpdate(
      '61feb1cde3057b613098ed1c',
      { $inc: { count: 1 } },
    );
    const gameNo = count.count;

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

    // *****************************************************************
    // *****************************************************************
    // *****************************************************************
    // minting token

    try {
      const contractAddress = '0x1B6FC2A8535bFf5f8425806FB9A884a881237faF';
      const privatekey = process.env.WALLET_KEY;
      const provider = new Provider(privatekey, process.env.RPC_URL);
      const web3 = new Web3(provider);
      const myContract = new web3.eth.Contract(
        JSON.parse(ABI),
        contractAddress,
      );
      await myContract.methods
        .mintNFTTT(winner, gameNo, URI.cid.toString())
        .send({ from: process.env.WALLET_ADDRESS });
      return 'Minted Successfully';
    } catch (e) {
      console.log(e);
      return 'Minting unsuccessful';
    }
  }

  async goOnline(address: string, key: string): Promise<string> {
    const database = admin.database();
    const res = await database.ref('onlineUsersKey').child(address).get();
    if (res.val() == null) {
      key = key.replace('-', '').replace('_', '');
      await database.ref('onlineUsersKey').child(address).set(key);
      await database.ref('onlineUsers').child(address).set(address);
      await database.ref('KeysToUser').child(key).set(address);
      return key;
    } else {
      return 'error';
    }
  }

  async goOffline(key: string) {
    const database = admin.database();
    key = key.replace('-', '').replace('_', '');
    const address = await database.ref('KeysToUser').child(key).get();
    if (address.val() != null) {
      await database.ref('onlineUsersKey').child(address.val()).remove();
      await database.ref('onlineUsers').child(address.val()).remove();
      await database.ref('KeysToUser').child(key).remove();
    }
    return;
  }

  async sendRequest(address: string, key: string) {
    const database = admin.database();
    const res = await database.ref('KeysToUser').child(key).get();
    if (res.val() != null) {
      await database
        .ref('usersInfo')
        .child(res.val())
        .child('requestedTo')
        .child(address)
        .set(address);
      await database
        .ref('usersInfo')
        .child(address)
        .child('requests')
        .child(res.val())
        .set(res.val());

      setTimeout(async () => {
        await database
          .ref('usersInfo')
          .child(res.val())
          .child('requestedTo')
          .child(address)
          .remove();
        await database
          .ref('usersInfo')
          .child(address)
          .child('requests')
          .child(res.val())
          .remove();
      }, 15000);

      return;
    }
  }
}
