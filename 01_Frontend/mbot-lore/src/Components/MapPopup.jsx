import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import './css/MapPopup.css';

const MapPopup = ({ onClose, points = [], mapWidth = 800, mapHeight = 500 }) => {
  const testData = useMemo(() => [//Testdaten falls das backend keine Daten liefert
  { id: 0, distance: 0.5, angle: 0 },
  { id: 1, distance: 1.0, angle: 20 },
  { id: 2, distance: 1.5, angle: 40 },
  { id: 3, distance: 1.2, angle: 60 },
  { id: 4, distance: 0.8, angle: 80 },
  { id: 5, distance: 1.0, angle: 100 },
  { id: 6, distance: 1.3, angle: 120 },
  { id: 7, distance: 0.9, angle: 140 },
  { id: 8, distance: 1.1, angle: 160 },
  { id: 9, distance: 1.4, angle: 180 },
  ], []);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const popupRef = useRef(null);

  const [stats, setStats] = useState({
    totalDistance: 0,
    areaCovered: 0,
    obstacleCount: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const displayPoints = useMemo(() => {
    if (!Array.isArray(points) || points.length === 0) return testData;
    return points.map(point => ({
      id: point.id || 0,
      distance: point.distance || 0,
      angle: point.angle || 0,
      isObstacle: point.isObstacle || false
    }));
  }, [points, testData]);

  const polarToCartesian = useCallback((points) => {
    let x = 0, y = 0, totalDistance = 0;
    const cartesianPoints = points.map(point => {
      const rad = (point.angle * Math.PI) / 180;
      x += point.distance * Math.cos(rad);
      y += point.distance * Math.sin(rad);
      totalDistance += point.distance;
      return { ...point, x, y };
    });
    return { points: cartesianPoints, totalDistance };
  }, []);

  // Enhanced convex hull calculation with obstacle consideration  --> Ermittlung der äußeren Hülle mit Erkennung von Hindernissen.
  const calculateConvexHull = useCallback((points) => {
    if (points.length < 3) return points;

    const crossProduct = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    // Filter out obstacle points for hull calculation
    const nonObstaclePoints = points.filter(p => !p.isObstacle);
    if (nonObstaclePoints.length < 3) return points;

    const pointLineDistance = (p, a, b) => {
      return Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) /
        Math.sqrt((b.y - a.y) ** 2 + (b.x - a.x) ** 2);
    };

    const findHull = (points, a, b) => {
      if (points.length === 0) return [];

      const farthestPoint = points.reduce((farthest, p) => {
        const distance = pointLineDistance(p, a, b);
        return distance > farthest.distance ? { point: p, distance } : farthest;
      }, { point: null, distance: -Infinity }).point;

      const leftOfLine1 = points.filter(p => crossProduct(a, farthestPoint, p) > 0);
      const leftOfLine2 = points.filter(p => crossProduct(farthestPoint, b, p) > 0);

      return [
        ...findHull(leftOfLine1, a, farthestPoint),
        farthestPoint,
        ...findHull(leftOfLine2, farthestPoint, b)
      ];
    };

    const minXPoint = nonObstaclePoints.reduce((min, p) => (p.x < min.x ? p : min), nonObstaclePoints[0]);
    const maxXPoint = nonObstaclePoints.reduce((max, p) => (p.x > max.x ? p : max), nonObstaclePoints[0]);

    const leftOfLine = nonObstaclePoints.filter(p => crossProduct(minXPoint, maxXPoint, p) > 0);
    const rightOfLine = nonObstaclePoints.filter(p => crossProduct(maxXPoint, minXPoint, p) > 0);

    return [
      minXPoint,
      ...findHull(leftOfLine, minXPoint, maxXPoint),
      maxXPoint,
      ...findHull(rightOfLine, maxXPoint, minXPoint)
    ];
  }, []);

  const calculateTransform = useCallback((points, width, height) => {
    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);
    const minX = Math.min(...xValues), maxX = Math.max(...xValues);
    const minY = Math.min(...yValues), maxY = Math.max(...yValues);

    const scale = Math.min(width / (maxX - minX || 1), height / (maxY - minY || 1)) * 0.8;
    const offsetX = (width - (maxX + minX) * scale) / 2;
    const offsetY = (height - (maxY + minY) * scale) / 2;

    const hull = calculateConvexHull(points);
    const area = Math.abs(hull.reduce((sum, p, i) => {
      const next = hull[(i + 1) % hull.length];
      return sum + (p.x * next.y - p.y * next.x);
    }, 0)) / 2;

    return { offsetX, offsetY, scale, area, hull };
  }, [calculateConvexHull]);

  // Enhanced obstacle detection algorithm
  const detectObstacles = useCallback((points) => {
    if (points.length < 3) return points;
//DEFINE OBSTACLE
    // Parameters for obstacle detection
    const MIN_OBSTACLE_POINTS = 3; // Minimum points to form an obstacle
    const OBSTACLE_RADIUS = 0.3; // Max distance between points to be considered part of same obstacle
    const ANGLE_CHANGE_THRESHOLD = 45; // Degrees to consider sharp turn

    //Identify potential obstacle points based on sharp turns
    const pointsWithAngles = points.map((point, i) => {
      if (i === 0 || i === points.length - 1) return { ...point, angleChange: 0 };
      
      const prev = points[i-1];
      const next = points[i+1];
      
      // Calculate vectors
      const v1 = { x: point.x - prev.x, y: point.y - prev.y };
      const v2 = { x: next.x - point.x, y: next.y - point.y };
      
      // Calculate angle between vectors
      const dot = v1.x * v2.x + v1.y * v2.y;
      const det = v1.x * v2.y - v1.y * v2.x;
      const angle = Math.abs(Math.atan2(det, dot) * 180 / Math.PI);
      
      return { ...point, angleChange: angle };
    });

    //Cluster points that are close together and have sharp turns
    const obstacleClusters = [];
    let currentCluster = [];
    
    for (let i = 0; i < pointsWithAngles.length; i++) {
      const point = pointsWithAngles[i];
      
      // Check if point has sharp turn or is close to previous point in cluster
      if (point.angleChange > ANGLE_CHANGE_THRESHOLD || 
          (currentCluster.length > 0 && 
           Math.hypot(point.x - currentCluster[currentCluster.length-1].x, 
                     point.y - currentCluster[currentCluster.length-1].y) < OBSTACLE_RADIUS)) {
        currentCluster.push(point);
      } else {
        if (currentCluster.length >= MIN_OBSTACLE_POINTS) {
          obstacleClusters.push([...currentCluster]);
        }
        currentCluster = [];
      }
    }
    
    // Add last cluster if it meets criteria
    if (currentCluster.length >= MIN_OBSTACLE_POINTS) {
      obstacleClusters.push([...currentCluster]);
    }

    //Mark all points in clusters as obstacles
    const obstaclePoints = new Set();
    obstacleClusters.forEach(cluster => {
      cluster.forEach(point => obstaclePoints.add(point.id));
    });

    // Return points with obstacle markers
    return points.map(point => ({
      ...point,
      isObstacle: obstaclePoints.has(point.id) || point.isObstacle
    }));
  }, []);

  const drawMapPhased = useCallback((ctx, points, transform, hull, phase) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);

    // Draw points and obstacles
    if (phase >= 0) {
      points.forEach((point, i) => {
        const size = 5 / transform.scale;
        ctx.fillStyle = point.isObstacle ? 'rgba(255, 165, 0, 0.8)' : 
                        i === 0 ? '#37bc9b' : 
                        i === points.length - 1 ? '#da4453' : 
                        '#5d9cec';
        
        // Draw obstacle points with different style
        if (point.isObstacle) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 140, 0, 0.8)';
          ctx.lineWidth = 2 / transform.scale;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Draw path between points (skip obstacle segments)
    if (phase >= 1) {
      ctx.strokeStyle = '#4a89dc';
      ctx.lineWidth = 2 / transform.scale;
      ctx.beginPath();
      
      let isObstacleSegment = false;
      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
          return;
        }
        
        const prevPoint = points[i-1];
        const currentIsObstacle = point.isObstacle || prevPoint.isObstacle;
        
        if (currentIsObstacle && !isObstacleSegment) {
          // Start of obstacle segment
          ctx.stroke();
          ctx.beginPath();
          isObstacleSegment = true;
        } else if (!currentIsObstacle && isObstacleSegment) {
          // End of obstacle segment
          ctx.moveTo(point.x, point.y);
          isObstacleSegment = false;
        }
        
        if (!currentIsObstacle) {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      
      // Draw dashed lines for obstacle segments
      ctx.setLineDash([5 / transform.scale, 3 / transform.scale]);
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)';
      ctx.beginPath();
      
      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
          return;
        }
        
        const prevPoint = points[i-1];
        if (point.isObstacle || prevPoint.isObstacle) {
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw hull outline
    if (phase >= 2 && hull.length >= 3) {
      ctx.strokeStyle = '#e9573f';
      ctx.lineWidth = 3 / transform.scale;
      ctx.beginPath();
      hull.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    // Fill hull
    if (phase >= 3 && hull.length >= 3) {
      ctx.fillStyle = 'rgba(233, 87, 63, 0.2)';
      ctx.beginPath();
      hull.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }, []);

  const animateDrawing = useCallback((ctx, cartesianPoints, transform, hull) => {
    let startTime = null;
    const duration = 4000;
    const phases = [
      { start: 0, duration: 0.25 },
      { start: 0.25, duration: 0.5 },
      { start: 0.75, duration: 0.15 },
      { start: 0.9, duration: 0.1 }
    ];

    const animationStep = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      let currentPhase = 0;
      let phaseProgress = 0;
      
      for (let i = 0; i < phases.length; i++) {
        if (progress >= phases[i].start && progress <= phases[i].start + phases[i].duration) {
          currentPhase = i;
          phaseProgress = (progress - phases[i].start) / phases[i].duration;
          break;
        } else if (progress > phases[i].start + phases[i].duration) {
          currentPhase = i + 1;
          phaseProgress = 1;
        }
      }
      
      const phaseValue = currentPhase + phaseProgress;
      drawMapPhased(ctx, cartesianPoints, transform, hull, phaseValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animationStep);
      }
    };

    animationRef.current = requestAnimationFrame(animationStep);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawMapPhased]);

  useEffect(() => {
    const { points: cartesianPoints, totalDistance } = polarToCartesian(displayPoints);
    const pointsWithObstacles = detectObstacles(cartesianPoints);
    const { offsetX, offsetY, scale, area, hull } = calculateTransform(pointsWithObstacles, mapWidth, mapHeight);

    // Count obstacles
    const obstacleCount = pointsWithObstacles.filter(p => p.isObstacle).length;

    setStats({ 
      totalDistance, 
      areaCovered: area,
      obstacleCount
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animateDrawing(ctx, pointsWithObstacles, { offsetX, offsetY, scale }, hull);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [displayPoints, mapWidth, mapHeight, polarToCartesian, calculateTransform, detectObstacles, animateDrawing]);

  return (
    <div className={`map-popup-overlay ${isVisible ? 'visible' : ''}`} ref={popupRef}>
      <div className="map-popup-window">
        <div className="map-popup-header">
          <h2>Explorationskarte</h2>
          <button className="popup-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="map-stats-container">
          <div className="stat-item">
            <span className="stat-label">Punkte</span>
            <span className="stat-value">{displayPoints.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Distanz</span>
            <span className="stat-value">{(stats.totalDistance / 10).toFixed(2)} cm</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Fläche</span>
            <span className="stat-value">{(stats.areaCovered / 100).toFixed(2)} cm²</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hindernisse</span>
            <span className="stat-value">{stats.obstacleCount}</span>
          </div>
        </div>
        <div className="map-canvas-container">
          <canvas ref={canvasRef} width={mapWidth} height={mapHeight} className="map-canvas" />
        </div>
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-color start-point"></span>
            <span>Startpunkt</span>
          </div>
          <div className="legend-item">
            <span className="legend-color end-point"></span>
            <span>Endpunkt</span>
          </div>
          <div className="legend-item">
            <span className="legend-color path"></span>
            <span>Weg</span>
          </div>
          <div className="legend-item">
            <span className="legend-color area"></span>
            <span>Bereich</span>
          </div>
          <div className="legend-item">
            <span className="legend-color obstacle"></span>
            <span>Hindernis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

MapPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  points: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      distance: PropTypes.number,
      angle: PropTypes.number,
      isObstacle: PropTypes.bool
    })
  ),
  mapWidth: PropTypes.number,
  mapHeight: PropTypes.number
};

export default MapPopup;