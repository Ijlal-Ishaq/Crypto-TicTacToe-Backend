/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */

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

    const projectId = '2DFPFIAaXx9w2afULnEiEsSk6VF';
    const projectSecret = '9efe90a3f717625277f8464bc47952f1';

    const auth =
      'Basic ' +
      Buffer.from(projectId + ':' + projectSecret).toString('base64');

    const options = {
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    };

    const node = create(options);

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
      loser.substr(0, 9) + '.....' + loser.substr(33, 42),
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
      image: res.cid.toString(),
    };
    const URI = await node.add(JSON.stringify(URI_Obj));

    console.log(URI);

    // *****************************************************************
    // *****************************************************************
    // *****************************************************************
    // minting token

    try {
      const contractAddress = '0x7f0c1bAE7Ed06bF1479f1Be3B23CE08c4872dc7e';
      const privatekey = process.env.WALLET_KEY;
      const provider = new Provider(privatekey, process.env.RPC_URL);
      const web3 = new Web3(provider);
      const myContract = new web3.eth.Contract(
        JSON.parse(ABI),
        contractAddress,
      );
      await myContract.methods
        .setWinner(winner, gameNo, URI.cid.toString())
        .send({ from: process.env.WALLET_ADDRESS });
      return 'successful';
    } catch (e) {
      console.log(e);
      return 'unsuccessful';
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
      // await database.ref('KeysToUser').child(key).remove();
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

  async acceptRequest(address: string, key: string) {
    const database = admin.database();
    key = key.replace('-', '').replace('_', '');
    const myAddress = await database.ref('KeysToUser').child(key).get();
    const opponentAddress = await database
      .ref('onlineUsers')
      .child(address)
      .get();
    const opponentGame = await database
      .ref('usersInfo')
      .child(opponentAddress.val())
      .child('game')
      .get();

    if (
      myAddress.val() != null &&
      opponentAddress.val() != null &&
      (opponentGame.val() == '-' || opponentGame.val() == null)
    ) {
      const gameKey = await database.ref('gamesRoom').push({
        player1: opponentAddress.val(),
        player2: myAddress.val(),
        turn:
          Math.floor(Math.random() * 2) == 0
            ? opponentAddress.val()
            : myAddress.val(),
        board: {
          '1': '-',
          '2': '-',
          '3': '-',
          '4': '-',
          '5': '-',
          '6': '-',
          '7': '-',
          '8': '-',
          '9': '-',
        },
        winner: '-',
        draw: '-',
      });

      await database
        .ref('usersInfo')
        .child(opponentAddress.val())
        .child('game')
        .set(gameKey.key);

      await database
        .ref('usersInfo')
        .child(myAddress.val())
        .child('game')
        .set(gameKey.key);
    }
    return;
  }

  async makeAMove(gameKey: string, key: string, position: string) {
    const database = admin.database();
    const address = await database.ref('KeysToUser').child(key).get();
    const game = await database.ref('gamesRoom').child(gameKey).get();
    const isPlayer1 = game.val()['player1'] == address.val() ? true : false;

    if (
      game.val()['turn'] == address.val() &&
      game.val()['board'][position.toString()] == '-' &&
      game.val()['winner'] == '-'
    ) {
      await database
        .ref('gamesRoom')
        .child(gameKey)
        .child('turn')
        .set(isPlayer1 ? game.val()['player2'] : game.val()['player1']);

      await database
        .ref('gamesRoom')
        .child(gameKey)
        .child('board')
        .child(position.toString())
        .set(isPlayer1 ? 0 : 1);

      const latestGame = await database.ref('gamesRoom').child(gameKey).get();

      const result = await this.checkWinner(latestGame);

      if (result) {
        await database
          .ref('gamesRoom')
          .child(gameKey)
          .child('winner')
          .set(address.val());

        await database
          .ref('usersInfo')
          .child(game.val()['player1'])
          .child('game')
          .set('-');

        await database
          .ref('usersInfo')
          .child(game.val()['player2'])
          .child('game')
          .set('-');

        const agaist =
          game.val()['player1'] == address.val()
            ? game.val()['player2']
            : game.val()['player1'];

        await this.mintNFT(address.val(), agaist);

        setTimeout(async () => {
          await database.ref('gamesRoom').child(gameKey).remove();
        }, 30000);
      } else {
        const draw = await this.checkDraw(latestGame);

        if (draw) {
          await database
            .ref('gamesRoom')
            .child(gameKey)
            .child('draw')
            .set('true');

          await database
            .ref('usersInfo')
            .child(game.val()['player1'])
            .child('game')
            .set('-');

          await database
            .ref('usersInfo')
            .child(game.val()['player2'])
            .child('game')
            .set('-');

          setTimeout(async () => {
            await database.ref('gamesRoom').child(gameKey).remove();
          }, 30000);
        }
      }
    }
  }

  async checkWinner(game: any): Promise<boolean> {
    if (
      (game.val()['board']['1'] == game.val()['board']['2'] &&
        game.val()['board']['2'] == game.val()['board']['3'] &&
        game.val()['board']['1'] != '-') ||
      (game.val()['board']['4'] == game.val()['board']['5'] &&
        game.val()['board']['5'] == game.val()['board']['6'] &&
        game.val()['board']['4'] != '-') ||
      (game.val()['board']['7'] == game.val()['board']['8'] &&
        game.val()['board']['8'] == game.val()['board']['9'] &&
        game.val()['board']['7'] != '-') ||
      (game.val()['board']['1'] == game.val()['board']['4'] &&
        game.val()['board']['4'] == game.val()['board']['7'] &&
        game.val()['board']['1'] != '-') ||
      (game.val()['board']['2'] == game.val()['board']['5'] &&
        game.val()['board']['5'] == game.val()['board']['8'] &&
        game.val()['board']['2'] != '-') ||
      (game.val()['board']['3'] == game.val()['board']['6'] &&
        game.val()['board']['6'] == game.val()['board']['9'] &&
        game.val()['board']['3'] != '-') ||
      (game.val()['board']['1'] == game.val()['board']['5'] &&
        game.val()['board']['5'] == game.val()['board']['9'] &&
        game.val()['board']['1'] != '-') ||
      (game.val()['board']['3'] == game.val()['board']['5'] &&
        game.val()['board']['5'] == game.val()['board']['7'] &&
        game.val()['board']['3'] != '-')
    ) {
      return true;
    } else {
      return false;
    }
  }

  async checkDraw(game: any): Promise<boolean> {
    if (
      game.val()['board']['1'] != '-' &&
      game.val()['board']['2'] != '-' &&
      game.val()['board']['3'] != '-' &&
      game.val()['board']['4'] != '-' &&
      game.val()['board']['5'] != '-' &&
      game.val()['board']['6'] != '-' &&
      game.val()['board']['7'] != '-' &&
      game.val()['board']['8'] != '-' &&
      game.val()['board']['9'] != '-'
    ) {
      return true;
    } else {
      return false;
    }
  }
}
