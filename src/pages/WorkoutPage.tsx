import React from 'react';
import './WorkoutPage.css';

const WorkoutPage: React.FC = () => {
  return (
    <div className="workout-page">
      <div className="page-header">
        <h2>💪 ワークアウト記録</h2>
        <p>今日のトレーニングを記録しましょう</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h3>実装予定</h3>
        <p>トレーニング記録機能を実装中です</p>
        <ul className="feature-list">
          <li>種目選択・カスタム種目追加</li>
          <li>セット・レップ・重量の記録</li>
          <li>リアルタイム休憩タイマー</li>
          <li>ワークアウト完了時の統計表示</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkoutPage;