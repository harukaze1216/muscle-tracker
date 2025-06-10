import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WorkoutPage from './pages/WorkoutPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import DataService from './services/dataService';
import './App.css';

function App() {
  useEffect(() => {
    // アプリ起動時の初期化
    const initializeApp = () => {
      // DataServiceの設定
      const dataSource = process.env.REACT_APP_DATA_SOURCE as 'firestore' | 'localStorage' | 'hybrid' || 'hybrid';
      DataService.configure({
        dataSource,
        fallbackToLocal: true,
        syncToFirestore: dataSource !== 'localStorage',
      });

      // オンライン/オフライン同期の初期化
      DataService.initializeOnlineSync();

      console.log(`Muscle Tracker initialized with ${dataSource} data source`);
    };

    initializeApp();
  }, []);

  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
