import React, { useEffect, useMemo, useState } from "react";
import { FaCheck, FaPersonWalking, FaWind } from "react-icons/fa6";
import { IoWaterOutline } from "react-icons/io5";
import { MdSelfImprovement } from "react-icons/md";
import {
  STORAGE_KEYS,
  getDateKey,
  readStorage,
  writeStorage
} from "../dashboardUtils";

const CHECKLIST_ITEMS = [
  { id: "drink-water", label: "Drink water", icon: IoWaterOutline },
  { id: "deep-breathing", label: "Deep breathing", icon: FaWind },
  { id: "stretching", label: "Stretching", icon: MdSelfImprovement },
  { id: "short-walk", label: "Short walk", icon: FaPersonWalking }
];

const createDefaultChecklistState = () => ({
  date: getDateKey(),
  checklist: CHECKLIST_ITEMS.reduce((result, item) => {
    result[item.id] = false;
    return result;
  }, {})
});

function Checklist() {
  const [trackerState, setTrackerState] = useState(
    createDefaultChecklistState
  );

  useEffect(() => {
    const savedState = readStorage(
      STORAGE_KEYS.wellnessChecklist,
      createDefaultChecklistState()
    );
    const todayKey = getDateKey();

    if (savedState.date === todayKey) {
      setTrackerState({
        ...createDefaultChecklistState(),
        ...savedState,
        checklist: {
          ...createDefaultChecklistState().checklist,
          ...(savedState.checklist || {})
        }
      });
      return;
    }

    const resetState = createDefaultChecklistState();
    setTrackerState(resetState);
    writeStorage(STORAGE_KEYS.wellnessChecklist, resetState);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wellnessChecklist, trackerState);
  }, [trackerState]);

  const completedTasks = useMemo(
    () => Object.values(trackerState.checklist).filter(Boolean).length,
    [trackerState]
  );

  const toggleChecklistItem = (taskId) => {
    setTrackerState((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [taskId]: !current.checklist[taskId]
      }
    }));
  };

  return (
    <article className="wellness-panel checklist-panel">
      <div className="wellness-panel-header">
        <div>
          <h4 className="wellness-panel-title">Daily Checklist</h4>
          <p className="wellness-panel-copy">
            {completedTasks}/{CHECKLIST_ITEMS.length} completed
          </p>
        </div>
        <div className="wellness-chip">
          <FaCheck />
          <span>{completedTasks} done</span>
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
  );
}

export default Checklist;
