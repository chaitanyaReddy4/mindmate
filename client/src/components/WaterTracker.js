import React, { useEffect, useMemo, useState } from "react";
import { FaGlassWater, FaPlus } from "react-icons/fa6";
import {
  STORAGE_KEYS,
  WATER_TARGET_ML,
  getDateKey,
  readStorage,
  writeStorage
} from "../dashboardUtils";

const createDefaultWaterState = () => ({
  date: getDateKey(),
  waterMl: 0
});

function WaterTracker() {
  const [trackerState, setTrackerState] = useState(createDefaultWaterState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waterInput, setWaterInput] = useState("250");

  useEffect(() => {
    const savedState = readStorage(
      STORAGE_KEYS.wellnessWater,
      createDefaultWaterState()
    );
    const todayKey = getDateKey();

    if (savedState.date === todayKey) {
      setTrackerState({ ...createDefaultWaterState(), ...savedState });
      return;
    }

    const resetState = createDefaultWaterState();
    setTrackerState(resetState);
    writeStorage(STORAGE_KEYS.wellnessWater, resetState);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wellnessWater, trackerState);
  }, [trackerState]);

  const progress = useMemo(() => {
    const consumed = Math.max(0, Number(trackerState.waterMl) || 0);
    const remaining = Math.max(WATER_TARGET_ML - consumed, 0);
    const percentage = Math.min(
      100,
      Math.round((consumed / WATER_TARGET_ML) * 100)
    );

    return { consumed, remaining, percentage };
  }, [trackerState]);

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
    setWaterInput("250");
    setIsModalOpen(false);
  };

  return (
    <article className="wellness-panel water-panel">
      <div className="wellness-panel-header">
        <div>
          <h4 className="wellness-panel-title">Water Tracker</h4>
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
          <div className="water-stat-card">
            <span className="water-stat-label">Progress</span>
            <strong className="water-stat-value">
              {progress.percentage}%
            </strong>
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
        <div
          className="tracker-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
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
  );
}

export default WaterTracker;
