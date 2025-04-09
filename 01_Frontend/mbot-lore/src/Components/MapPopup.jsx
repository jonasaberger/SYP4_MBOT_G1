import React, { useEffect, useRef, useState } from "react";
import "./css/MapPopup.css";

const MapPopup = ({ onClose, points, mapWidth, mapHeight }) => {
  const canvasRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [transform, setTransform] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1
  });

  const calculateTransform = (pointsToShow) => {
    if (pointsToShow.length === 0) return { offsetX: 0, offsetY: 0, scale: 1 };

    const cartesianPoints = [{ x: 0, y: 0 }];
    let currentX = 0, currentY = 0;

    pointsToShow.forEach(([_, distance, angle]) => {
      const rad = (angle * Math.PI) / 180;
      currentX += distance * Math.cos(rad);
      currentY += distance * Math.sin(rad);
      cartesianPoints.push({ x: currentX, y: currentY });
    });

    const xCoords = cartesianPoints.map(p => p.x);
    const yCoords = cartesianPoints.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const width = maxX - minX;
    const height = maxY - minY;

    const canvas = canvasRef.current;
    const scaleX = (canvas.width * 0.9) / (width || 1);
    const scaleY = (canvas.height * 0.9) / (height || 1);
    const scale = Math.min(scaleX, scaleY);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const offsetX = canvas.width / 2 - centerX * scale;
    const offsetY = canvas.height / 2 - centerY * scale;

    return { offsetX, offsetY, scale };
  };

  // Hilfsfunktionen
  const calculatePerimeter = (points) => {
    let perimeter = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      perimeter += Math.hypot(dx, dy);
    }
    // Optional: zurück zum Startpunkt (wenn polygon geschlossen)
    const dx = points[0].x - points[points.length - 1].x;
    const dy = points[0].y - points[points.length - 1].y;
    perimeter += Math.hypot(dx, dy);
    return perimeter;
  };

  const calculateArea = (points) => {
    // Shoelace-Formel
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 300;
    canvas.height = 150;

    const pointsToShow = points.slice(0, currentStep + 1);
    const newTransform = calculateTransform(pointsToShow);
    setTransform(newTransform);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    let currentX = 0, currentY = 0;
    ctx.save();
    ctx.translate(newTransform.offsetX, newTransform.offsetY);
    ctx.scale(newTransform.scale, newTransform.scale);

    pointsToShow.forEach(([index, distance, angle], i) => {
      const rad = (angle * Math.PI) / 180;
      const nextX = currentX + distance * Math.cos(rad);
      const nextY = currentY + distance * Math.sin(rad);

      if (i > 0) {
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2 / newTransform.scale;
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      }

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(nextX, nextY, 5 / newTransform.scale, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.font = `${12 / newTransform.scale}px Arial`;
      ctx.fillText(`${index}`, nextX + 10 / newTransform.scale, nextY);

      currentX = nextX;
      currentY = nextY;
    });

    if (points.length >= 100) {
      const cartesianPoints = [];
      let cx = 0, cy = 0;
      points.forEach(([_, distance, angle]) => {
        const rad = (angle * Math.PI) / 180;
        cx += distance * Math.cos(rad);
        cy += distance * Math.sin(rad);
        cartesianPoints.push({ x: cx, y: cy });
      });

      // Raster für Hindernisse
      const gridSize = 20;
      const frequencyMap = new Map();

      for (const p of cartesianPoints) {
        const keyX = Math.floor(p.x / gridSize);
        const keyY = Math.floor(p.y / gridSize);
        const key = `${keyX},${keyY}`;
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
      }

      frequencyMap.forEach((count, key) => {
        if (count >= 5) {
          const [gx, gy] = key.split(",").map(Number);
          ctx.fillStyle = "black";
          ctx.fillRect(
            gx * gridSize,
            gy * gridSize,
            gridSize,
            gridSize
          );
        }
      });

      // Raum-Rahmen (Rechteck)
      const xCoords = cartesianPoints.map(p => p.x);
      const yCoords = cartesianPoints.map(p => p.y);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2 / newTransform.scale;
      ctx.beginPath();
      ctx.moveTo(minX, minY);
      ctx.lineTo(maxX, minY);
      ctx.lineTo(maxX, maxY);
      ctx.lineTo(minX, maxY);
      ctx.closePath();
      ctx.stroke();

      // Umfang & Fläche berechnen und ausgeben
      const perimeter = calculatePerimeter(cartesianPoints);
      const area = calculateArea(cartesianPoints);
      console.log("📏 Umfang:", perimeter.toFixed(2), "Einheiten");
      console.log("📐 Fläche:", area.toFixed(2), "Quadrateinheiten");
    }

    ctx.restore();

    if (currentStep < points.length - 1) {
      const timeout = setTimeout(() => setCurrentStep(prev => prev + 1), 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, points]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid black",
            width: "100%",
            height: "100%",
            maxWidth: "800px",
            maxHeight: "600px"
          }}
        />
      </div>
    </div>
  );
};

export default MapPopup;
