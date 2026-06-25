 import "./gate.css";
 import Link from "next/link";

export default function SovereignGate() {
  return (
    <main className="gate-page">

      <div className="gold-frame">

        <div className="gold-corner top-left"></div>
        <div className="gold-corner top-right"></div>
        <div className="gold-corner bottom-left"></div>
        <div className="gold-corner bottom-right"></div>

        <section className="gate-container">

          <div className="gate-badge">
            بوابة العبور السيادي
          </div>

          <h1 className="gate-title">
            حدد هويتك السيادية
          </h1>

          <div className="gate-buttons">

            
  <Link
  href="/sovereign-member"
  className="identity-btn"
>
  <span className="icon">👑</span>
  <span>عضو سيادي</span>
</Link>

            <button className="guest-btn">
              <span className="icon">🏛️</span>
              <span> المستكشف السيادى</span>
            </button>

          </div>

        </section>

      </div>

      <button className="voice-bubble">
        🎙️
      </button>

    </main>
  );
}