import React from 'react';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>📊 詳細分析</h2>
        <p>パフォーマンスの推移を確認</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h3>実装予定</h3>
        <p>分析機能を実装中です</p>
        <ul className="feature-list">
          <li>種目別重量・回数の推移グラフ</li>
          <li>部位別トレーニング頻度の分析</li>
          <li>週間・月間パフォーマンス統計</li>
          <li>目標達成度の可視化</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;