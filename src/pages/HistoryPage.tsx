import React from 'react';
import './HistoryPage.css';

const HistoryPage: React.FC = () => {
  return (
    <div className="history-page">
      <div className="page-header">
        <h2>📅 ワークアウト履歴</h2>
        <p>過去のトレーニング記録を確認</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h3>実装予定</h3>
        <p>履歴閲覧機能を実装中です</p>
        <ul className="feature-list">
          <li>カレンダー形式での記録表示</li>
          <li>日別・月別のワークアウト一覧</li>
          <li>記録の編集・削除機能</li>
          <li>期間指定での統計表示</li>
        </ul>
      </div>
    </div>
  );
};

export default HistoryPage;