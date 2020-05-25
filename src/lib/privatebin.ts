import axios, { AxiosResponse } from 'axios';
import { encode } from 'bs58';

import { encrypt } from './cryptotools';
import { Privatebin, PrivatebinOptions } from '../common/types';
import { Spec, PasteData } from '../common/types';

export function getBufferPaste(data: string): Buffer {
  return Buffer.from(
    JSON.stringify({
      paste: data,
    }),
    'utf8',
  );
}

function getSpec(burnafterreading: number, opendiscussion: number): Spec {
  return {
    algo: 'aes',
    mode: 'gcm',
    ks: 256,
    ts: 128,
    iter: 100000,
    compression: 'none',
    burnafterreading,
    opendiscussion,
  };
}

export function getPaste(pasteUrl: string): Promise<AxiosResponse> {
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'JSONHttpRequest',
    },
  };

  return axios.get(pasteUrl, config);
}

function sendPaste(paste: PasteData, host: string, expire: string): Promise<AxiosResponse> {
  const { ct, adata } = paste;
  const postData = {
    v: 2,
    ct,
    adata,
    meta: { expire },
  };

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(JSON.stringify(postData)),
      'X-Requested-With': 'JSONHttpRequest',
    },
  };

  return axios.post(host, postData, config);
}

function parseResponse(response: AxiosResponse, host: string, randomKey: Buffer): Privatebin {
  return {
    id: response.data.id,
    url: `${host}${response.data.url}#${encode(randomKey)}`,
    deleteUrl: `${host}/?pasteid=${response.data.id}&deletetoken=${response.data.deletetoken}`,
  };
}

export default async function privatebin(
  host: string,
  pasteData: Buffer,
  randomKey: Buffer,
  options: PrivatebinOptions,
): Promise<Privatebin> {
  const { burnafterreading, opendiscussion, expire } = options;
  const spec = getSpec(burnafterreading, opendiscussion);
  const response = await sendPaste(encrypt(pasteData, randomKey, spec), host, expire);
  return parseResponse(response, host, randomKey);
}
