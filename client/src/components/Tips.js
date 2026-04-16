import React from "react";
import { FaMugHot, FaPersonWalking, FaStopwatch, FaWind } from "react-icons/fa6";

const TIPS = [
  {
    title: "Drink 2-3L water",
    copy: "Keep a steady pace through the day instead of catching up late.",
    icon: FaMugHot
  },
  {
    title: "Take breaks",
    copy: "Step away from screens for a short reset between focused sessions.",
    icon: FaStopwatch
  },
  {
    title: "Walk 10 minutes",
    copy: "A small walk can soften stress and help your thoughts settle.",
    icon: FaPersonWalking
  },
  {
    title: "Practice breathing",
    copy: "Try slow inhales and longer exhales when your body feels tense.",
    icon: FaWind
  }
];

function Tips() {
  return (
    <article className="summary-card wellness-tips-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-section-label">Wellness Suggestions</p>
          <h3 className="summary-card-title">Small resets that compound</h3>
        </div>
      </div>

      <div className="tips-grid">
        {TIPS.map((tip) => {
          const Icon = tip.icon;

          return (
            <div key={tip.title} className="tip-item">
              <span className="tip-icon">
                <Icon />
              </span>
              <div className="tip-content">
                <h4 className="tip-title">{tip.title}</h4>
                <p className="tip-copy">{tip.copy}</p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default Tips;
