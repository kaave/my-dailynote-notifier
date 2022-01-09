import dotenv from 'dotenv';

dotenv.config();

export const notePath = process.env.NOTE_PATH ?? '';
if (!notePath) {
  throw new Error('set NOTE_PATH variable');
}

export const token = process.env.SLACK_TOKEN ?? '';
if (!token) {
  throw new Error('set SLACK_TOKEN variable');
}

export const channel = process.env.SLACK_CHANNEL ?? '';
if (!channel) {
  throw new Error('set SLACK_CHANNEL variable');
}

export const debounceMsec = Number(process.env.DEBOUNCE_SEC ?? '10') * 1000;
