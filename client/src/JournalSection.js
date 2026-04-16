import React, { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaRegSave } from "react-icons/fa";
import { STORAGE_KEYS, getDateKey, readStorage, writeStorage } from "./dashboardUtils";

function JournalSection() {
  const todayKey = getDateKey();
  const [entries, setEntries] = useState({});
  const [draft, setDraft] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const storedEntries = readStorage(STORAGE_KEYS.journal, {});
    setEntries(storedEntries);
    setDraft(storedEntries[todayKey] || "");
  }, [todayKey]);

  const previousEntries = useMemo(
    () =>
      Object.entries(entries)
        .filter(([date]) => date !== todayKey && Boolean(entries[date]))
        .sort((left, right) => new Date(right[0]) - new Date(left[0]))
        .slice(0, 5),
    [entries, todayKey]
  );

  const handleSave = () => {
    const nextEntries = {
      ...entries,
      [todayKey]: draft.trim()
    };

    setEntries(nextEntries);
    writeStorage(STORAGE_KEYS.journal, nextEntries);
    setSavedMessage("Today's journal entry is saved.");

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2200);
  };

  return (
    <section className="summary-card journal-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-section-label">Daily Journal</p>
          <h3 className="summary-card-title">Capture today in a few lines</h3>
          <p className="summary-card-copy">
            Write a short reflection to keep track of how your day feels over time.
          </p>
        </div>
        <div className="summary-badge">
          <FaBookOpen />
          <span>{todayKey}</span>
        </div>
      </div>

      <div className="journal-layout">
        <div className="journal-editor">
          <textarea
            className="journal-textarea"
            placeholder="How are you feeling today?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="journal-actions">
            <button type="button" className="tracker-action-button" onClick={handleSave}>
              <FaRegSave />
              <span>Save</span>
            </button>
            {savedMessage ? <span className="journal-save-message">{savedMessage}</span> : null}
          </div>
        </div>

        <div className="journal-history">
          <div className="journal-preview-card">
            <h4 className="wellness-panel-title">Today's saved entry</h4>
            <p className="journal-preview-copy">
              {entries[todayKey]
                ? entries[todayKey]
                : "No journal saved for today yet."}
            </p>
          </div>

          <div className="journal-preview-card">
            <h4 className="wellness-panel-title">Previous entries</h4>
            {previousEntries.length > 0 ? (
              <div className="journal-history-list">
                {previousEntries.map(([date, entry]) => (
                  <div key={date} className="journal-history-item">
                    <strong className="journal-history-date">{date}</strong>
                    <p className="journal-history-copy">
                      {entry.length > 96 ? `${entry.slice(0, 96)}...` : entry}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="journal-preview-copy">
                Earlier journal entries will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JournalSection;
