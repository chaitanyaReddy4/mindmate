import React from "react";
import JournalSection from "../components/JournalSection";

function Journal() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Journal</p>
          <h1 className="page-title">Private reflections</h1>
          <p className="page-description">
            A calmer space for daily writing, mood tagging, and steady journaling habits.
          </p>
        </div>
      </div>

      <JournalSection />
    </section>
  );
}

export default Journal;
