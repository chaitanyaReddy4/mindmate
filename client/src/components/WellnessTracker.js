import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Checklist from "./Checklist";
import WaterTracker from "./WaterTracker";
import { apiClient } from "../api/apiClient";
import {
  buildWeeklyWellnessSeries,
  calculateStreak,
  getDateKey,
  readStorage,
  STORAGE_KEYS,
  WELLNESS_CHECKLIST_ITEMS,
  writeStorage
} from "../dashboardUtils";
import { useToast } from "../context/ToastContext";

const createEmptyChecklist = () =>
  WELLNESS_CHECKLIST_ITEMS.reduce((result, item) => {
    result[item.id] = false;
    return result;
  }, {});

function WellnessTracker() {
  const todayKey = getDateKey();
  const { showToast } = useToast();
  const [entry, setEntry] = useState(() => {
    const cachedEntry = readStorage(STORAGE_KEYS.wellness, null);

    if (cachedEntry?.date === todayKey) {
      return {
        ...cachedEntry,
        checklist: {
          ...createEmptyChecklist(),
          ...(cachedEntry.checklist || {})
        }
      };
    }

    return {
      date: todayKey,
      waterMl: 0,
      checklist: createEmptyChecklist()
    };
  });
  const [weeklyEntries, setWeeklyEntries] = useState([]);
  const [customWaterInput, setCustomWaterInput] = useState("250");
  const [showCustomWater, setShowCustomWater] = useState(false);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wellness, entry);
  }, [entry]);

  useEffect(() => {
    const loadWellness = async () => {
      try {
        const [todayResponse, weeklyResponse] = await Promise.all([
          apiClient.get("/wellness", { params: { date: todayKey } }),
          apiClient.get("/wellness", { params: { range: "week", endDate: todayKey } })
        ]);

        setEntry({
          ...todayResponse.data.entry,
          checklist: {
            ...createEmptyChecklist(),
            ...(todayResponse.data.entry?.checklist || {})
          }
        });
        setWeeklyEntries(weeklyResponse.data.entries || []);
      } catch (error) {
        showToast({
          title: "Wellness unavailable",
          message:
            error?.response?.data?.message ||
            "We could not load your wellness history.",
          variant: "error"
        });
      }
    };

    loadWellness();
  }, [showToast, todayKey]);

  const syncEntry = async (nextEntry) => {
    setEntry(nextEntry);

    try {
      await apiClient.put("/wellness", nextEntry);
      setWeeklyEntries((current) => {
        const remaining = current.filter((item) => item.date !== nextEntry.date);
        return [...remaining, nextEntry].sort((left, right) =>
          left.date.localeCompare(right.date)
        );
      });
    } catch (error) {
      showToast({
        title: "Update failed",
        message:
          error?.response?.data?.message ||
          "We could not save your wellness update.",
        variant: "error"
      });
    }
  };

  const handleWaterChange = async (amount) => {
    await syncEntry({
      ...entry,
      waterMl: Math.max(0, entry.waterMl + amount)
    });
  };

  const handleToggleChecklist = async (taskId) => {
    await syncEntry({
      ...entry,
      checklist: {
        ...entry.checklist,
        [taskId]: !entry.checklist[taskId]
      }
    });
  };

  const weeklySeries = useMemo(
    () => buildWeeklyWellnessSeries(weeklyEntries),
    [weeklyEntries]
  );

  const completedToday = useMemo(
    () => Object.values(entry.checklist || {}).filter(Boolean).length,
    [entry.checklist]
  );

  const wellnessStreak = useMemo(
    () =>
      calculateStreak(
        weeklyEntries
          .filter((item) => item.waterMl > 0 || Object.values(item.checklist || {}).some(Boolean))
          .map((item) => item.date)
      ),
    [weeklyEntries]
  );

  return (
    <div className="wellness-grid">
      <div className="wellness-main-grid">
        <WaterTracker
          waterMl={entry.waterMl}
          onQuickAdd={handleWaterChange}
          onCustomAdd={() => setShowCustomWater(true)}
        />
        <Checklist checklist={entry.checklist} onToggle={handleToggleChecklist} />
      </div>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">This week</p>
            <h2 className="section-title">Progress and streaks</h2>
          </div>
          <span className="section-badge">{wellnessStreak} day streak</span>
        </div>

        <div className="ring-grid">
          <article className="mini-ring-card">
            <div
              className="progress-ring"
              style={{
                "--progress": `${Math.min(100, Math.round((entry.waterMl / 2000) * 100))}%`
              }}
            >
              <span>{entry.waterMl}ml</span>
            </div>
            <p>Today's water intake</p>
          </article>
          <article className="mini-ring-card">
            <div
              className="progress-ring"
              style={{
                "--progress": `${Math.round(
                  (completedToday / WELLNESS_CHECKLIST_ITEMS.length) * 100
                )}%`
              }}
            >
              <span>{completedToday}</span>
            </div>
            <p>Checklist completed</p>
          </article>
        </div>

        <div className="trend-list">
          {weeklySeries.map((item) => (
            <div key={item.date} className="trend-row">
              <div className="trend-row-head">
                <strong>{item.dayLabel}</strong>
                <span>{item.hydrationPercent}%</span>
              </div>
              <div className="trend-bar">
                <motion.span
                  className="trend-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.hydrationPercent}%` }}
                />
              </div>
              <small>{item.completedTasks} checklist items completed</small>
            </div>
          ))}
        </div>
      </section>

      {showCustomWater ? (
        <div className="tracker-modal-backdrop">
          <div className="tracker-modal" role="dialog" aria-modal="true">
            <h3 className="section-title">Add custom amount</h3>
            <p className="muted-copy">Enter the amount of water you just had.</p>
            <input
              type="number"
              min="1"
              step="50"
              className="settings-field-input"
              value={customWaterInput}
              onChange={(event) => setCustomWaterInput(event.target.value)}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowCustomWater(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={async () => {
                  await handleWaterChange(Number(customWaterInput) || 0);
                  setCustomWaterInput("250");
                  setShowCustomWater(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default WellnessTracker;
