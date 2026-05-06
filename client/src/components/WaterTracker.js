import React from "react";
import { motion } from "framer-motion";
import { FaGlassWater, FaPlus } from "react-icons/fa6";
import { WATER_TARGET_ML } from "../dashboardUtils";

function WaterTracker({ waterMl = 0, onQuickAdd, onCustomAdd }) {
  const percentage = Math.min(100, Math.round((waterMl / WATER_TARGET_ML) * 100));
  const remaining = Math.max(WATER_TARGET_ML - waterMl, 0);

  return (
    <section className="surface-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Hydration</p>
          <h2 className="section-title">Water tracker</h2>
        </div>
        <span className="section-badge">
          <FaGlassWater />
          {percentage}%
        </span>
      </div>

      <div className="water-card-layout">
        <div className="progress-ring progress-ring-large" style={{ "--progress": `${percentage}%` }}>
          <span>{percentage}%</span>
        </div>

        <div className="water-stats-grid">
          <article className="metric-tile">
            <span className="stat-label">Consumed</span>
            <strong className="stat-value">{waterMl}ml</strong>
          </article>
          <article className="metric-tile">
            <span className="stat-label">Remaining</span>
            <strong className="stat-value">{remaining}ml</strong>
          </article>
          <article className="metric-tile">
            <span className="stat-label">Target</span>
            <strong className="stat-value">{WATER_TARGET_ML}ml</strong>
          </article>
        </div>
      </div>

      <div className="chip-row">
        {[200, 250, 350, 500].map((amount) => (
          <button
            key={amount}
            type="button"
            className="pill-button"
            onClick={() => onQuickAdd(amount)}
          >
            +{amount}ml
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        className="primary-button"
        onClick={onCustomAdd}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaPlus />
        <span>Add custom amount</span>
      </motion.button>
    </section>
  );
}

export default WaterTracker;
