/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */

import * as mongoose from 'mongoose';

export const NFTCountSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
  },
});

export interface NFTCount {
  _id: string;
  count: string;
}
