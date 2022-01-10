import fs from 'fs-extra';
import chokidar from 'chokidar';
import * as Diff from 'diff';
import { debounceMsec, notePath } from './config';
import { sendToSlack } from './client';
import type { FSWatcher } from 'chokidar';

type YMD = string & { readonly __ymd: unique symbol };
type Markdown = string & { readonly __markdown: unique symbol };

function readMarkdown(filepath: string): Markdown {
  return fs.readFileSync(filepath).toString() as Markdown;
}

function createDateString(filePath: string): YMD {
  return filePath.replace(`${notePath}/`, '').replace(/\.md$/, '') as YMD;
}

const cache: Record<string, string> = {};
const trigger: Record<string, NodeJS.Timeout | undefined> = {};

export function watch(): FSWatcher {
  const watcher = chokidar.watch(notePath);
  console.info(`create watcher [${notePath}]`);
  watcher
    .on('add', (filepath) => {
      // 初回起動の際も発火するので、サボらずちゃんとレンダリングする
      const ymd = createDateString(filepath);
      const html = readMarkdown(filepath);
      cache[ymd] = html;
      console.info(`added [${filepath}]`);
    })
    .on('change', (filepath) => {
      const ymd = createDateString(filepath);
      const markdown = readMarkdown(filepath);
      const currentTimer = trigger[ymd];
      console.info(`changed [${filepath}]`);
      if (currentTimer) {
        global.clearTimeout(currentTimer);
        console.info(`clear timer [${currentTimer}]`);
      }

      Diff.diffTrimmedLines(cache[ymd], markdown, { newlineIsToken: true })
        // 追加 だけ見れば十分
        // .filter(({ added, removed }) => added || removed)
        .filter(({ added }) => added)
        .forEach(({ value }) => {
          trigger[ymd] = global.setTimeout(() => {
            // 掃除
            value = value.split("\n").map(s => {
              if (s.startsWith('```')) {
                return '```';
              }

              return s;
            }).join("\n").trim();

            sendToSlack(value);
            console.info(`sendToSlack [${value}]`);

            // set cache
            cache[ymd] = markdown;
            trigger[ymd] = undefined;
          }, debounceMsec);
        });
    });

  return watcher;
}

export function unwatch(watcher: FSWatcher) {
  watcher.removeAllListeners();
  watcher.close();
}
