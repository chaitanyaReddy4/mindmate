import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarDay,
  FaFireFlameCurved,
  FaPenToSquare,
  FaTrashCan
} from "react-icons/fa6";
import { apiClient } from "../api/apiClient";
import {
  calculateStreak,
  countWords,
  formatDateLabel,
  getDateKey,
  JOURNAL_MOOD_OPTIONS,
  readStorage,
  STORAGE_KEYS,
  writeStorage
} from "../dashboardUtils";
import { useToast } from "../context/ToastContext";

function JournalSection() {
  const todayKey = getDateKey();
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [dateInput, setDateInput] = useState(todayKey);
  const [drafts, setDrafts] = useState(() => readStorage(STORAGE_KEYS.journalDrafts, {}));
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("Neutral");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await apiClient.get("/journal");
        setEntries(response.data.entries || []);
      } catch (error) {
        showToast({
          title: "Journal unavailable",
          message:
            error?.response?.data?.message ||
            "We could not load your saved journal entries.",
          variant: "error"
        });
      }
    };

    loadEntries();
  }, [showToast]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.journalDrafts, drafts);
  }, [drafts]);

  const entryMap = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries]
  );

  const selectedEntry = entryMap.get(selectedDate);
  const activeDraft = drafts[selectedDate];
  const wordCount = countWords(content);
  const streakCount = calculateStreak(entries.map((entry) => entry.date));

  useEffect(() => {
    if (activeDraft) {
      setContent(activeDraft.content || "");
      setMoodTag(activeDraft.moodTag || "Neutral");
      return;
    }

    setContent(selectedEntry?.content || "");
    setMoodTag(selectedEntry?.moodTag || "Neutral");
  }, [activeDraft, selectedEntry]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDrafts((current) => ({
        ...current,
        [selectedDate]: {
          content,
          moodTag
        }
      }));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [content, moodTag, selectedDate]);

  const previousEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.date !== selectedDate)
        .filter((entry) => {
          const haystack = `${entry.date} ${entry.moodTag || ""} ${entry.content}`.toLowerCase();
          return haystack.includes(searchQuery.trim().toLowerCase());
        })
        .slice(0, 8),
    [entries, searchQuery, selectedDate]
  );

  const saveEntry = async () => {
    setIsSaving(true);

    try {
      const response = await apiClient.put("/journal", {
        date: selectedDate,
        content,
        moodTag
      });

      const savedEntry = response.data.entry;
      setEntries((current) => {
        const nextEntries = current.filter((entry) => entry.date !== savedEntry.date);
        return [savedEntry, ...nextEntries].sort((left, right) =>
          right.date.localeCompare(left.date)
        );
      });

      setDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[selectedDate];
        return nextDrafts;
      });
      setLastSavedAt(new Date().toISOString());
      showToast({
        title: "Entry saved",
        message: `Your journal for ${selectedDate} is up to date.`,
        variant: "success"
      });
    } catch (error) {
      showToast({
        title: "Save failed",
        message:
          error?.response?.data?.message ||
          "We could not save this journal entry right now.",
        variant: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async () => {
    if (!selectedEntry) {
      return;
    }

    try {
      await apiClient.delete(`/journal/${selectedDate}`);
      setEntries((current) => current.filter((entry) => entry.date !== selectedDate));
      setContent("");
      setMoodTag("Neutral");
      showToast({
        title: "Entry deleted",
        message: `Your journal for ${selectedDate} was removed.`,
        variant: "success"
      });
    } catch (error) {
      showToast({
        title: "Delete failed",
        message:
          error?.response?.data?.message ||
          "We could not delete this journal entry right now.",
        variant: "error"
      });
    }
  };

  return (
    <div className="journal-grid">
      <section className="surface-card surface-card-large">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Writing space</p>
            <h2 className="section-title">Distraction-free editor</h2>
          </div>

          <div className="badge-row">
            <span className="section-badge">
              <FaFireFlameCurved />
              {streakCount} day streak
            </span>
            <span className="section-badge">
              <FaPenToSquare />
              {wordCount} words
            </span>
          </div>
        </div>

        <div className="journal-toolbar">
          <label className="settings-field">
            <span>Date</span>
            <input
              type="date"
              value={dateInput}
              max={todayKey}
              onChange={(event) => setDateInput(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="toolbar-button"
            onClick={() => setSelectedDate(dateInput || todayKey)}
          >
            <FaCalendarDay />
            <span>Go to Date</span>
          </button>

          <label className="settings-field journal-mood-field">
            <span>Mood tag</span>
            <select
              value={moodTag}
              onChange={(event) => setMoodTag(event.target.value)}
            >
              {JOURNAL_MOOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <textarea
          className="journal-textarea journal-textarea-large"
          placeholder="Write about what felt heavy, steady, or hopeful today."
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        <div className="journal-footer">
          <div className="journal-status">
            <span>{selectedEntry ? "Saved entry available" : "New entry"}</span>
            <span>
              {lastSavedAt
                ? `Last saved ${formatDateLabel(lastSavedAt, {
                    month: "short",
                    day: "numeric"
                  })}`
                : "Draft autosaves locally"}
            </span>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={saveEntry}
            disabled={isSaving}
          >
            <span>{isSaving ? "Saving..." : "Save entry"}</span>
          </button>
          {selectedEntry ? (
            <button type="button" className="secondary-button" onClick={deleteEntry}>
              <FaTrashCan />
              <span>Delete</span>
            </button>
          ) : null}
        </div>
      </section>

      <div className="journal-side-column">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Selected day</p>
              <h2 className="section-title">{formatDateLabel(selectedDate)}</h2>
            </div>
          </div>

          <p className="muted-copy">
            {selectedEntry?.content
              ? selectedEntry.content
              : "No entry has been saved for this date yet."}
          </p>
        </section>

        <section className="surface-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Recent entries</p>
              <h2 className="section-title">History</h2>
            </div>
          </div>

          <label className="settings-field">
            <span>Search entries</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by date, mood, or content"
            />
          </label>

          {previousEntries.length ? (
            <div className="timeline-list">
              {previousEntries.map((entry) => (
                <motion.button
                  key={entry.id}
                  type="button"
                  className="history-item-button"
                  onClick={() => {
                    setDateInput(entry.date);
                    setSelectedDate(entry.date);
                  }}
                  whileHover={{ y: -1 }}
                >
                  <strong>
                    {formatDateLabel(entry.date)}
                    {entry.moodTag ? ` - ${entry.moodTag}` : ""}
                  </strong>
                  <span>
                    {entry.content.length > 110
                      ? `${entry.content.slice(0, 110)}...`
                      : entry.content}
                  </span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state-compact">
              <h3 className="empty-state-title">No journal history yet</h3>
              <p className="empty-state-copy">
                Your previous reflections will show up here after you save them.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default JournalSection;
