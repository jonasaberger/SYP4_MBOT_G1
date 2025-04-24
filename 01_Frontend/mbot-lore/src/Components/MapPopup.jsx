import React, { useEffect, useRef, useState } from "react";
import "./css/MapPopup.css";

const MapPopup = ({ onClose, points }) => {
  const canvasRef = useRef(null);
  const [transform, setTransform] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1
  });

  const calculateTransform = (pointsToShow) => {
    if (pointsToShow.length === 0) return { offsetX: 0, offsetY: 0, scale: 1 };

    const cartesianPoints = [];
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

  const calculatePerimeter = (points) => {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      const dx = points[next].x - points[i].x;
      const dy = points[next].y - points[i].y;
      perimeter += Math.hypot(dx, dy);
    }
    return perimeter;
  };

  const calculateArea = (points) => {
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

    // Koordinaten berechnen
    const cartesianPoints = [];
    let x = 0, y = 0;
    points.forEach(([_, distance, angle]) => {
      const rad = (angle * Math.PI) / 180;
      x += distance * Math.cos(rad);
      y += distance * Math.sin(rad);
      cartesianPoints.push({ x, y });
    });

    const newTransform = calculateTransform(points);
    setTransform(newTransform);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(newTransform.offsetX, newTransform.offsetY);
    ctx.scale(newTransform.scale, newTransform.scale);

    // Punkte als Hindernisse zeichnen
    cartesianPoints.forEach(p => {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 / newTransform.scale, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Rechteck um alle Punkte
    const xCoords = cartesianPoints.map(p => p.x);
    const yCoords = cartesianPoints.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 / newTransform.scale;
    ctx.beginPath();
    ctx.rect(minX, minY, maxX - minX, maxY - minY);
    ctx.stroke();

    ctx.restore();

    // Fläche & Umfang loggen
    const perimeter = calculatePerimeter(cartesianPoints);
    const area = calculateArea(cartesianPoints);
    console.log("📏 Umfang:", perimeter.toFixed(2), "Einheiten");
    console.log("📐 Fläche:", area.toFixed(2), "Quadrateinheiten");
  }, [points]);

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
            maxWidth: "300px",
            maxHeight: "150px"
          }}
        />
      </div>
    </div>
  );
};

export default MapPopup;
