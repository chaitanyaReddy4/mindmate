import React from "react";

function CircularProgress({
  percentage = 0,
  label = "",
  color = "#5c78ff",
  size = 128,
  strokeWidth = 12,
  subtitle
}) {
  const safePercentage = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (safePercentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="circular-progress-card">
      <div
        className="circular-progress-shell"
        style={{ "--progress-color": color, width: size, height: size }}
      >
        <svg
          className="circular-progress-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${safePercentage}%`}
        >
          <circle
            className="circular-progress-track"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="circular-progress-indicator"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset
            }}
          />
        </svg>

        <div className="circular-progress-content">
          <strong className="circular-progress-value">{safePercentage}%</strong>
          <span className="circular-progress-caption">{label}</span>
        </div>
      </div>

      {subtitle ? (
        <p className="circular-progress-subtitle">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default CircularProgress;
