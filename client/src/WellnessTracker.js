import React, { useEffect, useMemo, useState } from "react";
import { FaCheck, FaGlassWater, FaPlus, FaPersonWalking, FaWind } from "react-icons/fa6";
import { IoWaterOutline } from "react-icons/io5";
import { MdSelfImprovement } from "react-icons/md";
import { STORAGE_KEYS, WATER_TARGET_ML, getDateKey, readStorage, writeStorage } from "./dashboardUtils";

const CHECKLIST_ITEMS = [
  { id: "drink-water", label: "Drink water", icon: IoWaterOutline },
  { id: "deep-breathing", label: "Deep breathing", icon: FaWind },
  { id: "stretching", label: "Stretching", icon: MdSelfImprovement },
  { id: "short-walk", label: "Short walk", icon: FaPersonWalking }
];

const createDefaultState = () => ({
  date: getDateKey(),
  waterMl: 0,
  checklist: CHECKLIST_ITEMS.reduce((result, item) => {
    result[item.id] = false;
    return result;
  }, {})
});

function WellnessTracker() {
  const [trackerState, setTrackerState] = useState(createDefaultState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waterInput, setWaterInput] = useState("200");

  useEffect(() => {
    const savedState = readStorage(STORAGE_KEYS.wellness, createDefaultState());
    const todayKey = getDateKey();

    if (savedState.date === todayKey) {
      setTrackerState({
        ...createDefaultState(),
        ...savedState,
        checklist: {
          ...createDefaultState().checklist,
          ...(savedState.checklist || {})
        }
      });
      return;
    }

    const resetState = createDefaultState();
    setTrackerState(resetState);
    writeStorage(STORAGE_KEYS.wellness, resetState);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wellness, trackerState);
  }, [trackerState]);

  const progress = useMemo(() => {
    const consumed = Math.max(0, Number(trackerState.waterMl) || 0);
    const percentage = Math.min(100, Math.round((consumed / WATER_TARGET_ML) * 100));
    const remaining = Math.max(WATER_TARGET_ML - consumed, 0);
    const completedTasks = Object.values(trackerState.checklist).filter(Boolean).length;

    return {
      consumed,
      remaining,
      percentage,
      completedTasks
    };
  }, [trackerState]);

  const toggleChecklistItem = (taskId) => {
    setTrackerState((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [taskId]: !current.checklist[taskId]
      }
    }));
  };

  const handleWaterSubmit = (event) => {
    event.preventDefault();
    const amount = Number(waterInput);

    if (!amount || amount < 1) {
      return;
    }

    setTrackerState((current) => ({
      ...current,
      waterMl: current.waterMl + amount
    }));
    setWaterInput("200");
    setIsModalOpen(false);
  };

  return (
    <section className="summary-card wellness-tracker-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-section-label">Wellness Tracker</p>
          <h3 className="summary-card-title">Hydration and daily reset</h3>
          <p className="summary-card-copy">
            Keep a simple pulse on your water intake and the habits that help you reset.
          </p>
        </div>
      </div>

      <div className="wellness-tracker-layout">
        <article className="wellness-panel water-panel">
          <div className="wellness-panel-header">
            <div>
              <h4 className="wellness-panel-title">Water Intake Tracker</h4>
              <p className="wellness-panel-copy">Daily target: 2L / 2000ml</p>
            </div>
            <div className="wellness-chip">
              <FaGlassWater />
              <span>{progress.percentage}%</span>
            </div>
          </div>

          <div className="water-visual">
            <div className="water-bottle">
              <div
                className="water-fill"
                style={{ height: `${progress.percentage}%` }}
              />
              <div className="water-bottle-label">{progress.percentage}%</div>
            </div>

            <div className="water-stats">
              <div className="water-stat-card">
                <span className="water-stat-label">Consumed</span>
                <strong className="water-stat-value">{progress.consumed}ml</strong>
              </div>
              <div className="water-stat-card">
                <span className="water-stat-label">Remaining</span>
                <strong className="water-stat-value">{progress.remaining}ml</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="tracker-action-button"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
            <span>Add Water</span>
          </button>

          {isModalOpen ? (
            <div className="tracker-modal-backdrop" onClick={() => setIsModalOpen(false)}>
              <div
                className="tracker-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <h5 className="tracker-modal-title">Add water intake</h5>
                <form className="tracker-modal-form" onSubmit={handleWaterSubmit}>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    inputMode="numeric"
                    className="tracker-input"
                    value={waterInput}
                    onChange={(event) => setWaterInput(event.target.value)}
                    placeholder="Enter ml"
                  />
                  <div className="tracker-modal-actions">
                    <button
                      type="button"
                      className="tracker-secondary-button"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="tracker-primary-button">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </article>

        <article className="wellness-panel checklist-panel">
          <div className="wellness-panel-header">
            <div>
              <h4 className="wellness-panel-title">Daily Checklist</h4>
              <p className="wellness-panel-copy">
                {progress.completedTasks}/{CHECKLIST_ITEMS.length} completed
              </p>
            </div>
            <div className="wellness-chip">
              <FaCheck />
              <span>{progress.completedTasks} done</span>
            </div>
          </div>

          <div className="tracker-checklist">
            {CHECKLIST_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCompleted = Boolean(trackerState.checklist[item.id]);

              return (
                <label
                  key={item.id}
                  className={`tracker-checklist-item ${
                    isCompleted ? "tracker-checklist-item-completed" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleChecklistItem(item.id)}
                  />
                  <span className="tracker-checkmark" aria-hidden="true" />
                  <span className="tracker-checklist-icon">
                    <Icon />
                  </span>
                  <span className="tracker-checklist-text">{item.label}</span>
                </label>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}

export default WellnessTracker;
