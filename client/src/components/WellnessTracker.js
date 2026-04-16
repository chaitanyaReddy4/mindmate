import React from "react";
import Checklist from "./Checklist";
import Tips from "./Tips";
import WaterTracker from "./WaterTracker";

function WellnessTracker() {
  return (
    <div className="wellness-page-grid">
      <div className="wellness-tracker-layout">
        <WaterTracker />
        <Checklist />
      </div>
      <Tips />
    </div>
  );
}

export default WellnessTracker;
