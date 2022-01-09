import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import Dotenv from 'dotenv-webpack';

import type { Configuration } from 'webpack';


console.log(
  process.env.NOTE_PATH,
  process.env.SLACK_TOKEN,
  process.env.SLACK_CHANNEL,
  process.env.DEBOUNCE_SEC,
);

// 開発者モードか否かで処理を分岐する
const isDev = process.env.NODE_ENV === 'development';

// 共通設定
const common: Configuration = {
  // モード切替
  mode: isDev ? 'development' : 'production',
  node: {
    /**
     * メインプロセスのコード中で使われる __dirname と __filename を
     * webpack が変換しないように false を指定する
     */
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  /**
   * macOS 上でのビルド失敗に対処するワークアラウンド
   * https://github.com/yan-foto/electron-reload/issues/71
   */
  externals: ['fsevents'],
  output: {
    // バンドルファイルの出力先（ここではプロジェクト直下の 'dist' ディレクトリ）
    path: path.resolve(__dirname, 'dist'),
    // webpack@5 + electron では必須の設定
    publicPath: './',
    /**
     * エントリーセクションでチャンク名を付けていれば
     * [name] へそのチャンク名が代入される
     */
    filename: '[name].js',
    // 画像などのアセット類は 'dist/assets' フォルダへ配置する
    assetModuleFilename: 'assets/[name][ext]',
  },
  module: {
    rules: [
      {
        /**
         * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
         * ただし node_modules ディレクトリは除外する
         */
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        /** 拡張子 '.css' （正規表現）のファイル */
        test: /\.css$/,
        /** use 配列に指定したローダーは *最後尾から* 順に適用される */
        use: [
          /* セキュリティ対策のため style-loader は使用しない **/
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        /** 画像やフォントなどのアセット類 */
        test: /\.(ico|png|jpe?g|svg|eot|woff?2?)$/,
        /** アセット類も同様に asset/inline は使用しない */
        /** なお、webpack@5.x では file-loader or url-loader は不要になった */
        type: 'asset/resource',
      },
    ],
  },
  /** 開発時には watch モードでファイルの変化を監視する  */
  watch: isDev,
  stats: 'errors-only',
  performance: { hints: false },
  /**
   * development モードではソースマップを付ける
   *
   * なお、開発時のレンダラープロセスではソースマップがないと
   * electron のデベロッパーコンソールに 'Uncaught EvalError' が
   * 表示されてしまうことに注意
   */
  devtool: isDev ? 'inline-source-map' : undefined,
};

const main: Configuration = {
  ...common,
  target: 'electron-main',
  entry: {
    main: './src/main.ts',
  },
  plugins: [
    new Dotenv(),
    // new webpack.DefinePlugin({
    //   NOTE_PATH: process.env.NOTE_PATH,
    //   SLACK_TOKEN: process.env.SLACK_TOKEN,
    //   SLACK_CHANNEL: process.env.SLACK_CHANNEL,
    //   DEBOUNCE_SEC: process.env.DEBOUNCE_SEC,
    // }),
  ],
};

const preload: Configuration = {
  ...common,
  target: 'electron-preload',
  entry: {
    preload: './src/preload.ts',
  },
};

const renderer: Configuration = {
  ...common,
  // セキュリティ対策として 'electron-renderer' ターゲットは使用しない
  target: 'web',
  entry: {
    renderer: './src/renderer.ts',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' },
      ]
    }),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      minify: !isDev,
      inject: 'body',
      filename: 'index.html',
      template: './src/index.html',
    }),
  ],
};

// 開発時にはレンダラープロセスのみを処理する（メインプロセスは tsc で処理）
const config = [renderer, ...(!isDev ? [main, preload] : [])];

export default config;
