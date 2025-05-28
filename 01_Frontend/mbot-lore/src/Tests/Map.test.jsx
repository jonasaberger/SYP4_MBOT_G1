import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPopup from './MapPopup';

describe('MapPopup Component', () => {
  const mockOnClose = jest.fn();
  const testPoints = [
    { id: 1, distance: 1.0, angle: 20 },
    { id: 2, distance: 1.5, angle: 40, isObstacle: true }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    render(<MapPopup onClose={mockOnClose} />);
    
    expect(screen.getByText('Explorationskarte')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('map-canvas')).toBeInTheDocument();
  });

  test('displays correct stats with test data', () => {
    render(<MapPopup onClose={mockOnClose} points={testPoints} />);
    
    expect(screen.getByText('Punkte')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 points
    expect(screen.getByText(/Distanz/)).toBeInTheDocument();
    expect(screen.getByText(/Fläche/)).toBeInTheDocument();
    expect(screen.getByText('Hindernisse')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 obstacle
  });

  test('calls onClose when close button is clicked', () => {
    render(<MapPopup onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('uses testData when no points are provided', () => {
    render(<MapPopup onClose={mockOnClose} points={[]} />);
    expect(screen.getByText('10')).toBeInTheDocument(); // default testData has 10 points
  });

  test('displays legend correctly', () => {
    render(<MapPopup onClose={mockOnClose} />);
    
    expect(screen.getByText('Startpunkt')).toBeInTheDocument();
    expect(screen.getByText('Endpunkt')).toBeInTheDocument();
    expect(screen.getByText('Weg')).toBeInTheDocument();
    expect(screen.getByText('Bereich')).toBeInTheDocument();
    expect(screen.getByText('Hindernis')).toBeInTheDocument();
  });

  test('handles canvas rendering', () => {
    render(<MapPopup onClose={mockOnClose} />);
    const canvas = screen.getByTestId('map-canvas');
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '500');
  });

  test('handles custom dimensions', () => {
    render(<MapPopup onClose={mockOnClose} mapWidth={1000} mapHeight={600} />);
    const canvas = screen.getByTestId('map-canvas');
    expect(canvas).toHaveAttribute('width', '1000');
    expect(canvas).toHaveAttribute('height', '600');
  });

  test('handles obstacle detection', () => {
    const pointsWithObstacles = [
      { id: 1, distance: 1.0, angle: 20 },
      { id: 2, distance: 1.5, angle: 40, isObstacle: true },
      { id: 3, distance: 1.2, angle: 60 }
    ];
    
    render(<MapPopup onClose={mockOnClose} points={pointsWithObstacles} />);
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 obstacle
  });

  test('calculates polar to cartesian conversion', () => {
    const { polarToCartesian } = require('./MapPopup');
    const result = polarToCartesian(testPoints);
    
    expect(result.totalDistance).toBeCloseTo(2.5);
    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toHaveProperty('x');
    expect(result.points[0]).toHaveProperty('y');
  });

  test('calculates convex hull', () => {
    const { calculateConvexHull } = require('./MapPopup');
    const cartesianPoints = [
      { x: 0, y: 0, isObstacle: false },
      { x: 1, y: 1, isObstacle: false },
      { x: 2, y: 2, isObstacle: false },
      { x: 1, y: 0, isObstacle: false }
    ];
    
    const hull = calculateConvexHull(cartesianPoints);
    expect(hull.length).toBeGreaterThanOrEqual(3);
  });

  test('handles empty points array', () => {
    render(<MapPopup onClose={mockOnClose} points={[]} />);
    expect(screen.getByText('0 m')).toBeInTheDocument(); // distance should be 0
    expect(screen.getByText('0 m²')).toBeInTheDocument(); // area should be 0
  });
});

// Mock canvas methods
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    setLineDash: jest.fn()
  }));
  
  window.requestAnimationFrame = jest.fn((callback) => {
    callback(0);
    return 0;
  });
  
  window.cancelAnimationFrame = jest.fn();
});