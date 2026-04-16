import React from "react";
import WellnessTracker from "../components/WellnessTracker";

function Wellness() {
  return (
    <section className="dashboard-panel page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Wellness Tracker</p>
          <h2 className="panel-title">Daily Wellness</h2>
          <p className="panel-description">
            Track hydration, gentle movement, breathing, and the small routines
            that support your day.
          </p>
        </div>
      </div>

      <WellnessTracker />
    </section>
  );
}

export default Wellness;
