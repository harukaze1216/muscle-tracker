import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { WorkoutSession } from '../../types/workout';
import { formatDate } from '../../utils/helpers';
import './ExerciseProgressChart.css';

interface ExerciseProgressData {
  date: string;
  maxWeight: number;
  avgWeight: number;
  totalVolume: number;
  totalReps: number;
  sets: number;
}

interface ExerciseProgressChartProps {
  sessions: WorkoutSession[];
  exerciseName: string;
  showMaxWeight?: boolean;
  showAvgWeight?: boolean;
  showVolume?: boolean;
  timeRange?: number; // 表示する日数（デフォルト: 90日）
}

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({
  sessions,
  exerciseName,
  showMaxWeight = true,
  showAvgWeight = true,
  showVolume = false,
  timeRange = 90,
}) => {
  const processData = (): ExerciseProgressData[] => {
    // 指定された種目を含むセッションのみフィルタリング
    const relevantSessions = sessions
      .filter(session => 
        session.exercises.some(ex => ex.name === exerciseName)
      )
      .filter(session => {
        const sessionDate = new Date(session.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);
        return sessionDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return relevantSessions.map(session => {
      const exercise = session.exercises.find(ex => ex.name === exerciseName);
      if (!exercise || exercise.sets.length === 0) {
        return {
          date: session.date,
          maxWeight: 0,
          avgWeight: 0,
          totalVolume: 0,
          totalReps: 0,
          sets: 0,
        };
      }

      const weights = exercise.sets.map(set => set.weight);
      const reps = exercise.sets.map(set => set.reps);
      const volumes = exercise.sets.map(set => set.weight * set.reps);

      const maxWeight = Math.max(...weights);
      const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
      const totalReps = reps.reduce((sum, r) => sum + r, 0);

      return {
        date: session.date,
        maxWeight: Math.round(maxWeight * 10) / 10,
        avgWeight: Math.round(avgWeight * 10) / 10,
        totalVolume: Math.round(totalVolume),
        totalReps,
        sets: exercise.sets.length,
      };
    });
  };

  const data = processData();

  if (data.length === 0) {
    return (
      <div className="exercise-progress-chart">
        <div className="chart-header">
          <h3>{exerciseName} - 進捗グラフ</h3>
        </div>
        <div className="no-data">
          <p>選択した期間にデータがありません</p>
          <p className="no-data-hint">ワークアウトを記録して進捗を確認しましょう</p>
        </div>
      </div>
    );
  }

  // 統計情報の計算
  const stats = {
    totalSessions: data.length,
    currentMax: data[data.length - 1]?.maxWeight || 0,
    allTimeMax: Math.max(...data.map(d => d.maxWeight)),
    improvement: data.length > 1 
      ? Math.round(((data[data.length - 1]?.maxWeight || 0) - (data[0]?.maxWeight || 0)) * 10) / 10
      : 0,
    totalVolume: data.reduce((sum, d) => sum + d.totalVolume, 0),
  };

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'maxWeight':
      case 'avgWeight':
        return [`${value}kg`, name === 'maxWeight' ? '最大重量' : '平均重量'];
      case 'totalVolume':
        return [`${value}kg`, '総挙上量'];
      default:
        return [value, name];
    }
  };

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="exercise-progress-chart">
      <div className="chart-header">
        <h3>{exerciseName} - 進捗グラフ</h3>
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">セッション数</span>
            <span className="stat-value">{stats.totalSessions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">現在の最大重量</span>
            <span className="stat-value">{stats.currentMax}kg</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">記録更新</span>
            <span className={`stat-value ${stats.improvement >= 0 ? 'positive' : 'negative'}`}>
              {stats.improvement >= 0 ? '+' : ''}{stats.improvement}kg
            </span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisTick}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <Legend />

            {showMaxWeight && (
              <Line
                type="monotone"
                dataKey="maxWeight"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
                name="最大重量"
              />
            )}

            {showAvgWeight && (
              <Line
                type="monotone"
                dataKey="avgWeight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#2563eb', strokeWidth: 2 }}
                name="平均重量"
                strokeDasharray="5 5"
              />
            )}

            {showVolume && (
              <Line
                type="monotone"
                dataKey="totalVolume"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#16a34a', strokeWidth: 2 }}
                name="総挙上量"
                yAxisId="volume"
              />
            )}

            {/* 目標ライン（過去最高の110%） */}
            {stats.allTimeMax > 0 && (
              <ReferenceLine 
                y={Math.round(stats.allTimeMax * 1.1 * 10) / 10} 
                stroke="#f59e0b" 
                strokeDasharray="8 8"
                label={{ value: `目標: ${Math.round(stats.allTimeMax * 1.1 * 10) / 10}kg`, position: "insideTopRight" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-insights">
        <h4>📈 インサイト</h4>
        <div className="insights-list">
          {stats.improvement > 0 && (
            <div className="insight positive">
              <span className="insight-icon">📈</span>
              <span>期間中に{stats.improvement}kgの向上！</span>
            </div>
          )}
          {stats.improvement < 0 && (
            <div className="insight negative">
              <span className="insight-icon">📉</span>
              <span>重量が{Math.abs(stats.improvement)}kg減少しています</span>
            </div>
          )}
          {stats.totalSessions >= 10 && (
            <div className="insight neutral">
              <span className="insight-icon">💪</span>
              <span>安定したトレーニング頻度を維持中</span>
            </div>
          )}
          {stats.totalSessions < 5 && (
            <div className="insight warning">
              <span className="insight-icon">⚠️</span>
              <span>より多くのデータで正確な分析が可能になります</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseProgressChart;