import React, { useState, useEffect } from 'react';
import { ExerciseTemplate } from '../../types/workout';
import { DataService } from '../../services/dataService';
import { getCategoryColor } from '../../utils/helpers';
import './ExerciseSelector.css';

interface ExerciseSelectorProps {
  onSelectExercise: (template: ExerciseTemplate) => void;
  onClose: () => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelectExercise, onClose }) => {
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ExerciseTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全て');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const exerciseTemplates = await DataService.getExerciseTemplates();
        setTemplates(exerciseTemplates);
        setFilteredTemplates(exerciseTemplates);
      } catch (error) {
        console.error('種目テンプレートの読み込みに失敗しました:', error);
      }
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    // カテゴリフィルター
    if (selectedCategory !== '全て') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.targetMuscles.some(muscle => 
          muscle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  const categories = ['全て', ...Array.from(new Set(templates.map(t => t.category)))];

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="exercise-selector-overlay">
      <div className="exercise-selector">
        <div className="selector-header">
          <h3>種目を選択</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="selector-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="種目名や筋肉で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                style={{
                  borderBottomColor: selectedCategory === category 
                    ? getCategoryColor(category) 
                    : 'transparent'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="exercises-list">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                className="exercise-item"
                onClick={() => onSelectExercise(template)}
              >
                <div className="exercise-main">
                  <div className="exercise-name">{template.name}</div>
                  <div className="exercise-details">
                    <span 
                      className="exercise-category"
                      style={{ backgroundColor: getCategoryColor(template.category) }}
                    >
                      {template.category}
                    </span>
                    <span 
                      className="exercise-difficulty"
                      style={{ color: getDifficultyColor(template.difficulty) }}
                    >
                      {getDifficultyLabel(template.difficulty)}
                    </span>
                    {template.equipment && (
                      <span className="exercise-equipment">{template.equipment}</span>
                    )}
                  </div>
                </div>
                <div className="exercise-muscles">
                  {template.targetMuscles.slice(0, 3).map((muscle, index) => (
                    <span key={index} className="muscle-tag">
                      {muscle}
                    </span>
                  ))}
                  {template.targetMuscles.length > 3 && (
                    <span className="muscle-tag">+{template.targetMuscles.length - 3}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-exercises">
              <p>条件に一致する種目が見つかりません</p>
              <p className="no-exercises-hint">検索条件を変更してみてください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseSelector;