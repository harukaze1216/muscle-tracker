import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import DataService from './services/dataService';

test('renders app header', () => {
  DataService.configure({ dataSource: 'localStorage', syncToFirestore: false });
  render(<App />);
  const headerElement = screen.getByText('💪 Muscle Tracker');
  expect(headerElement).toBeInTheDocument();
});
