import React from "react";
import JournalSection from "../components/JournalSection";

function Journal() {
  return (
    <section className="dashboard-panel page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Daily Reflection</p>
          <h2 className="panel-title">Journal</h2>
          <p className="panel-description">
            Save a dated reflection for today and revisit previous entries when
            you want a little perspective.
          </p>
        </div>
      </div>

      <JournalSection />
    </section>
  );
}

export default Journal;
