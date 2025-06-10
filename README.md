# 💪 Muscle Tracker

筋トレの記録と分析を行うWebアプリケーションです。AI提案機能により、効果的なトレーニングプランを提供します。

## ✨ 主な機能

- **トレーニング記録**: 種目別のセット・レップ・重量を記録
- **履歴表示**: カレンダー・リスト形式での記録閲覧
- **AI提案**: 過去データに基づく最適な種目提案
- **統計分析**: 進捗の可視化とパフォーマンス追跡
- **オフライン対応**: インターネット接続不要で利用可能
- **データ同期**: FirestoreまたはローカルストレージでのHybrid構成

## 🚀 セットアップ

### 1. インストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、Firebase設定を追加してください。

```bash
cp .env.example .env
```

### 3. Firebase設定（オプション）

Firestoreを使用する場合は、以下の手順でFirebaseプロジェクトを設定してください：

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreデータベースを有効化
3. プロジェクト設定から設定値を取得
4. `.env`ファイルに設定値を記載

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 4. データソースの選択

`.env`ファイルで使用するデータソースを指定できます：

- `REACT_APP_DATA_SOURCE=hybrid` (デフォルト): FirestoreとローカルストレージのHybrid
- `REACT_APP_DATA_SOURCE=firestore`: Firestoreのみ
- `REACT_APP_DATA_SOURCE=localStorage`: ローカルストレージのみ

## 📱 利用方法

### 開発サーバーの起動

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
