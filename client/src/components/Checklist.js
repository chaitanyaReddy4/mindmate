import React from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPersonWalking, FaWind } from "react-icons/fa6";
import { IoWaterOutline } from "react-icons/io5";
import { MdSelfImprovement } from "react-icons/md";
import { WELLNESS_CHECKLIST_ITEMS } from "../dashboardUtils";

const iconMap = {
  "drink-water": IoWaterOutline,
  "deep-breathing": FaWind,
  stretching: MdSelfImprovement,
  "short-walk": FaPersonWalking
};

function Checklist({ checklist = {}, onToggle }) {
  const completedTasks = WELLNESS_CHECKLIST_ITEMS.filter(
    (item) => checklist[item.id]
  ).length;

  return (
    <section className="surface-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Checklist</p>
          <h2 className="section-title">Wellness routine</h2>
        </div>
        <span className="section-badge">
          <FaCheck />
          {completedTasks}/{WELLNESS_CHECKLIST_ITEMS.length}
        </span>
      </div>

      <div className="tracker-checklist">
        {WELLNESS_CHECKLIST_ITEMS.map((item) => {
          const Icon = iconMap[item.id];
          const isCompleted = Boolean(checklist[item.id]);

          return (
            <motion.button
              key={item.id}
              type="button"
              className={`tracker-checklist-item ${
                isCompleted ? "tracker-checklist-item-completed" : ""
              }`}
              onClick={() => onToggle(item.id)}
              whileTap={{ scale: 0.995 }}
            >
              <span className="tracker-checklist-icon">
                <Icon />
              </span>
              <span className="tracker-checklist-text">{item.label}</span>
              <span className={`tracker-checkmark ${isCompleted ? "is-active" : ""}`} />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export default Checklist;
