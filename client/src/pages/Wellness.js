import React from "react";
import WellnessTracker from "../components/WellnessTracker";

function Wellness() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Wellness</p>
          <h1 className="page-title">Daily habits</h1>
          <p className="page-description">
            Track hydration, routines, and simple wins with a cleaner weekly view.
          </p>
        </div>
      </div>

      <WellnessTracker />
    </section>
  );
}

export default Wellness;
