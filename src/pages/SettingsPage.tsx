import React from 'react';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>⚙️ 設定</h2>
        <p>アプリの設定とデータ管理</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">🚧</div>
        <h3>実装予定</h3>
        <p>設定機能を実装中です</p>
        <ul className="feature-list">
          <li>ユーザー情報・単位設定</li>
          <li>デフォルト休憩時間の設定</li>
          <li>データのエクスポート・インポート</li>
          <li>カスタム種目の管理</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;