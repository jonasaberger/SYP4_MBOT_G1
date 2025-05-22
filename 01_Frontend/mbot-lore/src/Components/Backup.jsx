/*import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import './css/MapPopup.css';

const MapPopup = ({ onClose, points = [], mapWidth = 800, mapHeight = 500 }) => {
  const testData = useMemo(() => [
    { id: 0, distance: 0, angle: 0 },
    { id: 1, distance: 1.5, angle: 30 },
    { id: 2, distance: 1.2, angle: 75 },
    { id: 3, distance: 0.8, angle: 120 },
    { id: 4, distance: 1.0, angle: 165 },
    { id: 5, distance: 1.3, angle: 210 },
    { id: 6, distance: 0.9, angle: 255 },
    { id: 7, distance: 1.1, angle: 300 }   
  ], []);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const popupRef = useRef(null);

  const [stats, setStats] = useState({
    totalDistance: 0,
    areaCovered: 0
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
      angle: point.angle || 0
    }));
  }, [points, testData]);

  const polarToCartesian = useCallback((points) => {
    let x = 0, y = 0, totalDistance = 0;
    const cartesianPoints = points.map(point => {
      const rad = (point.angle * Math.PI) / 180;
      x += point.distance * Math.cos(rad);
      y += point.distance * Math.sin(rad);
      totalDistance += point.distance;
      return { x, y, id: point.id };
    });
    return { points: cartesianPoints, totalDistance };
  }, []);

  const calculateConvexHull = useCallback((points) => {
    if (points.length < 3) return points;

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

    const crossProduct = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const minXPoint = points.reduce((min, p) => (p.x < min.x ? p : min), points[0]);
    const maxXPoint = points.reduce((max, p) => (p.x > max.x ? p : max), points[0]);

    const leftOfLine = points.filter(p => crossProduct(minXPoint, maxXPoint, p) > 0);
    const rightOfLine = points.filter(p => crossProduct(maxXPoint, minXPoint, p) > 0);

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

  const drawMapPhased = useCallback((ctx, points, transform, hull, phase) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);

    // Draw points first
    if (phase >= 0) {
      points.forEach((point, i) => {
        const pointProgress = Math.min(1, phase - i * 0.2);
        if (pointProgress >= 0) {
          const size = 5 / transform.scale;
          ctx.fillStyle = i === 0 ? '#37bc9b' : 
                         i === points.length - 1 ? '#da4453' : 
                         '#5d9cec';
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect
          ctx.shadowColor = i === 0 ? '#37bc9b' : 
                            i === points.length - 1 ? '#da4453' : 
                            '#5d9cec';
          ctx.shadowBlur = 8 / transform.scale;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    }

    // Draw path between points
    if (phase >= 1) {
      const pathProgress = Math.min(1, (phase - 1) * points.length);
      const segmentsToDraw = Math.floor(pathProgress);
      const partialSegment = pathProgress - segmentsToDraw;

      ctx.strokeStyle = '#4a89dc';
      ctx.lineWidth = 2 / transform.scale;
      ctx.beginPath();
      
      // Draw complete segments
      for (let i = 0; i < segmentsToDraw && i < points.length - 1; i++) {
        if (i === 0) {
          ctx.moveTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[i+1].x, points[i+1].y);
      }

      // Draw partial segment
      if (segmentsToDraw < points.length - 1 && partialSegment > 0) {
        const startIdx = segmentsToDraw;
        const endIdx = startIdx + 1;
        const currentX = points[startIdx].x + (points[endIdx].x - points[startIdx].x) * partialSegment;
        const currentY = points[startIdx].y + (points[endIdx].y - points[startIdx].y) * partialSegment;
        
        if (startIdx === 0) {
          ctx.moveTo(points[startIdx].x, points[startIdx].y);
        } else {
          ctx.lineTo(points[startIdx].x, points[startIdx].y);
        }
        ctx.lineTo(currentX, currentY);
      }

      ctx.stroke();
    }

    // Draw hull outline
    if (phase >= 2 && hull.length >= 3) {
      const hullProgress = Math.min(1, (phase - 2) * 2);
      ctx.strokeStyle = '#e9573f';
      ctx.lineWidth = 3 / transform.scale;
      ctx.beginPath();
      
      // Draw complete segments
      const segmentsToDraw = Math.floor(hullProgress * hull.length);
      const partialSegment = hullProgress * hull.length - segmentsToDraw;

      for (let i = 0; i < segmentsToDraw; i++) {
        const nextIdx = (i + 1) % hull.length;
        if (i === 0) {
          ctx.moveTo(hull[i].x, hull[i].y);
        }
        ctx.lineTo(hull[nextIdx].x, hull[nextIdx].y);
      }

      // Draw partial segment
      if (segmentsToDraw < hull.length && partialSegment > 0) {
        const startIdx = segmentsToDraw % hull.length;
        const endIdx = (startIdx + 1) % hull.length;
        const currentX = hull[startIdx].x + (hull[endIdx].x - hull[startIdx].x) * partialSegment;
        const currentY = hull[startIdx].y + (hull[endIdx].y - hull[startIdx].y) * partialSegment;
        
        if (startIdx === 0) {
          ctx.moveTo(hull[startIdx].x, hull[startIdx].y);
        } else {
          ctx.lineTo(hull[startIdx].x, hull[startIdx].y);
        }
        ctx.lineTo(currentX, currentY);
      }

      if (hullProgress >= 1) {
        ctx.closePath();
      }
      ctx.stroke();
    }

    // Fill hull
    if (phase >= 3 && hull.length >= 3) {
      const fillProgress = Math.min(1, (phase - 3) * 3);
      ctx.fillStyle = `rgba(233, 87, 63, ${0.2 * fillProgress})`;
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
    const duration = 4000; // 4 seconds for full animation
    const phases = [
      { start: 0, duration: 0.25 }, // Points appear
      { start: 0.25, duration: 0.5 }, // Path draws
      { start: 0.75, duration: 0.15 }, // Hull outline
      { start: 0.9, duration: 0.1 } // Hull fill
    ];

    const animationStep = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate current phase and progress within phase
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
      
      // Calculate overall phase progress (0-4 range)
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
    const { offsetX, offsetY, scale, area, hull } = calculateTransform(cartesianPoints, mapWidth, mapHeight);

    setStats({ totalDistance, areaCovered: area });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start new animation
    animateDrawing(ctx, cartesianPoints, { offsetX, offsetY, scale }, hull);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [displayPoints, mapWidth, mapHeight, polarToCartesian, calculateTransform, animateDrawing]);

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
            <span className="stat-value">{stats.totalDistance.toFixed(2)} m</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Fläche</span>
            <span className="stat-value">{stats.areaCovered.toFixed(2)} m²</span>
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
      angle: PropTypes.number
    })
  ),
  mapWidth: PropTypes.number,
  mapHeight: PropTypes.number
};

export default MapPopup;

import React, { useState, useEffect, useRef } from "react";
import "./css/MapControl.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import { SketchPicker } from "react-color";
import { getDiscoveryPoints, sendCommand } from "../API_Service/service";
import MapPopup from "./MapPopup";

const ControlPanel = () => {
  // State variables
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [isOn, setIsOn] = useState(false);
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledColorString, setLedColorString] = useState("255,255,255");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [mapSize, setMapSize] = useState({
    width: Math.min(window.innerWidth * 0.8, 800),
    height: Math.min(window.innerHeight * 0.6, 500)
  });
  const [notification, setNotification] = useState(null);
  const commandCount = useRef(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setMapSize({
        width: Math.min(window.innerWidth * 0.8, 800),
        height: Math.min(window.innerHeight * 0.6, 500)
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const closeNotification = () => setNotification(null);

  // Handle start/stop command
  const handleStartStop = async () => {
    try {
      const command = commandCount.current % 2 === 0 ? "start" : "stop";
      commandCount.current += 1;

      await sendCommand("drive", command);

      if (command === "stop") {
        try {
          const points = await getDiscoveryPoints();
          console.log("Received points data:", points);

          // Convert points to proper format
          const formattedPoints = convertPointsData(points);
          
          if (formattedPoints.length > 0) {
            setMapPoints(formattedPoints);
          } else {
            // No valid points received - will use test data in MapPopup
            setMapPoints([]);
            setNotification({
              type: "warning",
              message: "No valid data received - showing test map"
            });
          }
          setShowPopup(true);
        } catch (error) {
          console.error("Error loading points:", error);
          // On error - will use test data in MapPopup
          setMapPoints([]);
          setShowPopup(true);
          setNotification({
            type: "warning",
            message: "Error loading data - showing test map"
          });
        }
      }
    } catch (error) {
      console.error("Command error:", error);
      setNotification({
        type: "error",
        message: "Error sending command!"
      });
    }
  };

  // Convert points data to proper format
  const convertPointsData = (points) => {
    if (!Array.isArray(points)) return [];
    
    return points.map((point, index) => {
      // Array format [id, distance, angle]
      if (Array.isArray(point) && point.length >= 3) {
        return {
          id: Number(point[0]) || index,
          distance: Number(point[1]) || 0,
          angle: Number(point[2]) || 0
        };
      }
      // Object format {id, distance, angle}
      else if (typeof point === 'object' && point !== null) {
        return {
          id: Number(point.id) || index,
          distance: Number(point.distance) || 0,
          angle: Number(point.angle) || 0
        };
      }
      // Invalid format
      return {
        id: index,
        distance: 0,
        angle: 0
      };
    }).filter(Boolean); // Remove null values
  };

  // Handle movement commands
  const handleMove = async (newDirection) => {
    try {
      setDirection(newDirection);
      await sendCommand("direction", newDirection);
      setNotification({ 
        type: "info", 
        message: `Direction changed: ${newDirection}` 
      });
    } catch (error) {
      console.error("Direction error:", error);
      setNotification({ 
        type: "error", 
        message: "Error changing direction!" 
      });
    }
  };

  // Toggle LED on/off
  const toggleSwitch = async () => {
    try {
      const newState = !isOn;
      setIsOn(newState);
      await sendCommand("led", newState ? "on" : "off");
      setNotification({ 
        type: "info", 
        message: `LED ${newState ? "on" : "off"}` 
      });
    } catch (error) {
      console.error("LED toggle error:", error);
      setIsOn(prev => !prev); // Revert state
      setNotification({ 
        type: "error", 
        message: "Error toggling LED!" 
      });
    }
  };

  // Color picker controls
  const toggleColorPicker = () => setShowColorPicker((prev) => !prev);

  const handleColorChange = (color) => {
    setLedColor(color.hex);
    const { r, g, b } = color.rgb;
    setLedColorString(`${r},${g},${b}`);
  };

  const handleColorSubmit = async () => {
    try {
      await sendCommand("color", ledColorString);
      setShowColorPicker(false);
      setNotification({ 
        type: "success", 
        message: "LED color set!" 
      });
    } catch (error) {
      console.error("Color set error:", error);
      setNotification({ 
        type: "error", 
        message: "Error setting color!" 
      });
    }
  };

  return (
    <div className="control-panel">
      {notification && (
        <div className={`notification ${notification.type}`} onClick={closeNotification}>
          {notification.message}
        </div>
      )}

      <div className="left-container">
        <div className="control-buttons">
          <button className="control-button start-stop-btn" onClick={handleStartStop}>
            {commandCount.current % 2 === 0 ? "Start" : "Stop"}
          </button>
        </div>

        <div className="led-container">
          <span className="led-label">LED</span>
          <div
            className={`toggle-switch ${isOn ? "on" : "off"}`}
            onClick={toggleSwitch}
          >
            <div className="toggle-handle"></div>
          </div>
          <div className="led-color-picker-container">
            <div
              className="led-color-picker-toggle"
              onClick={toggleColorPicker}
            >
              <div
                className="led-indicator"
                style={{ backgroundColor: ledColor }}
              ></div>
            </div>
            {showColorPicker && (
              <div className="led-color-picker">
                <SketchPicker color={ledColor} onChange={handleColorChange} />
                <button
                  className="control-button color-submit-button"
                  onClick={handleColorSubmit}
                >
                  Set Color
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="direction-buttons-container">
          <div className="direction-button-up">
            <button
              className={`control-button direction-btn up ${
                direction === "forward" ? "active" : ""
              }`}
              onClick={() => handleMove("forward")}
            >
              ↑
            </button>
          </div>
          <div className="direction-buttons-middle">
            <button
              className={`control-button direction-btn left ${
                direction === "left" ? "active" : ""
              }`}
              onClick={() => handleMove("left")}
            >
              ←
            </button>
            <button
              className={`control-button direction-btn down ${
                direction === "backward" ? "active" : ""
              }`}
              onClick={() => handleMove("backward")}
            >
              ↓
            </button>
            <button
              className={`control-button direction-btn right ${
                direction === "right" ? "active" : ""
              }`}
              onClick={() => handleMove("right")}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="robot-placeholder">
        <img
          src={require(`../Images/${direction}.png`)}
          alt={`Robot moving ${direction}`}
          className="robot-image"
        />
      </div>

      {showPopup && (
        <MapPopup
          onClose={() => setShowPopup(false)}
          points={mapPoints} // Empty array will trigger test data in MapPopup
          mapWidth={mapSize.width}
          mapHeight={mapSize.height}
        />
      )}

      {isCollapsed && (
        <button className="reveal-info-button" onClick={toggleCollapse}>
          ◁
        </button>
      )}

      <InfoPanel
        distance={distance}
        runtime={runtime}
        value={50}
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ControlPanel; 
//* eslint-disable react/prop-types */