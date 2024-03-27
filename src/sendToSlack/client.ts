import { WebClient } from '@slack/web-api';

import { token, channel } from './config';

const client = new WebClient(token);

export async function sendToSlack(message: string) {
  client.chat.postMessage({ text: message, channel, mrkdwn: true }).catch((e) => console.error(e));
}
