import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap');

        .bl * { box-sizing: border-box; margin: 0; padding: 0; }

        .bl { font-family: 'DM Sans', sans-serif; color: #1a2e22; background: #fff; }

        /* ── HERO ── */
        .bl-hero {
          min-height: 100vh;
          background: #0f2318;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 24px 96px;
          position: relative;
          overflow: hidden;
        }

        .bl-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 70% at 85% 40%, rgba(82,160,110,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 15% 75%, rgba(244,165,53,0.12) 0%, transparent 55%);
          pointer-events: none;
        }

        .bl-hero-inner { max-width: 860px; margin: 0 auto; position: relative; z-index: 1; }

        .bl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(168,213,181,0.12);
          border: 1px solid rgba(168,213,181,0.25);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #A8D5B5;
          margin-bottom: 32px;
        }

        .bl-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #52A06E;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }

        .bl-hero h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(40px, 6vw, 76px);
          font-weight: 900;
          line-height: 1.08;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 28px;
        }

        .bl-hero h1 em { font-style: italic; color: #A8D5B5; }

        .bl-hero-sub {
          font-size: clamp(16px, 2vw, 19px);
          color: rgba(255,255,255,0.55);
          line-height: 1.75;
          max-width: 540px;
          margin-bottom: 44px;
        }

        .bl-btn-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

        .bl-btn-green {
          background: #52A06E; color: #fff; border: none;
          border-radius: 10px; padding: 15px 30px;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .bl-btn-green:hover { background: #3d8a59; }
        .bl-btn-green:active { transform: scale(0.98); }

        .bl-btn-ghost {
          background: transparent; color: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 10px; padding: 15px 30px;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        }
        .bl-btn-ghost:hover { border-color: rgba(255,255,255,0.45); color: #fff; }

        .bl-scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.2); font-size: 11px;
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        .bl-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent);
          animation: scrollDown 1.8s ease-in-out infinite;
        }

        @keyframes scrollDown {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        /* ── TRUTH ── */
        .bl-truth { background: #F5F9F6; padding: 96px 24px; }

        .bl-truth-inner {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }

        .bl-truth-quote { border-left: 3px solid #F4A535; padding-left: 24px; }

        .bl-truth-quote blockquote {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700; font-style: italic;
          color: #1a2e22; line-height: 1.45; margin-bottom: 16px;
        }

        .bl-truth-quote cite { font-size: 13px; color: #7A9A84; font-style: normal; font-weight: 500; }

        .bl-truth-body h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(22px, 2.8vw, 30px);
          font-weight: 700; color: #1a2e22; line-height: 1.25; margin-bottom: 16px;
        }

        .bl-truth-body p { font-size: 15px; color: #5A7A6A; line-height: 1.8; margin-bottom: 12px; }

        .bl-stat-row { display: flex; gap: 32px; margin-top: 32px; flex-wrap: wrap; }

        .bl-stat { display: flex; flex-direction: column; gap: 3px; }

        .bl-stat-n {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 34px; font-weight: 900; color: #52A06E; line-height: 1;
        }

        .bl-stat-l { font-size: 11px; color: #7A9A84; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }

        /* ── HOW ── */
        .bl-how { background: #fff; padding: 96px 24px; }

        .bl-section-label {
          text-align: center; font-size: 11px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #52A06E; margin-bottom: 14px;
        }

        .bl-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px, 4vw, 38px); font-weight: 700;
          color: #1a2e22; text-align: center; line-height: 1.2; margin-bottom: 12px;
        }

        .bl-section-sub {
          text-align: center; font-size: 16px; color: #7A9A84;
          max-width: 460px; margin: 0 auto 56px; line-height: 1.65;
        }

        .bl-steps-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; max-width: 900px; margin: 0 auto;
          background: #E8F0EB; border-radius: 16px; overflow: hidden;
        }

        .bl-step { background: #fff; padding: 36px 28px; position: relative; }

        .bl-step-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }

        .bl-step-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 52px; font-weight: 900; color: #EAF3ED; line-height: 1; margin-bottom: 16px; display: block;
        }

        .bl-step-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 16px;
        }

        .bl-step h3 { font-size: 16px; font-weight: 600; color: #1a2e22; margin-bottom: 8px; }
        .bl-step p { font-size: 14px; color: #7A9A84; line-height: 1.65; }

        /* ── FEATURES ── */
        .bl-features { background: #0f2318; padding: 96px 24px; }

        .bl-features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1px; max-width: 960px; margin: 56px auto 0;
          background: rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden;
        }

        .bl-feature { background: #0f2318; padding: 36px 28px; transition: background 0.2s; }
        .bl-feature:hover { background: #162d1f; }

        .bl-feature-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(82,160,110,0.15); border: 1px solid rgba(82,160,110,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
        }

        .bl-feature h3 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 8px; }
        .bl-feature p { font-size: 14px; color: rgba(255,255,255,0.38); line-height: 1.65; }

        /* ── CTA ── */
        .bl-cta { background: #F5F9F6; padding: 96px 24px; text-align: center; }

        .bl-cta h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 4vw, 48px); font-weight: 900;
          color: #1a2e22; line-height: 1.18; margin-bottom: 20px;
          max-width: 580px; margin-left: auto; margin-right: auto;
        }

        .bl-cta h2 em { font-style: italic; color: #52A06E; }

        .bl-cta p {
          font-size: 16px; color: #7A9A84; max-width: 420px;
          margin: 0 auto 40px; line-height: 1.7;
        }

        .bl-btn-green-lg {
          background: #52A06E; color: #fff; border: none;
          border-radius: 12px; padding: 18px 40px;
          font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 600;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .bl-btn-green-lg:hover { background: #3d8a59; }
        .bl-btn-green-lg:active { transform: scale(0.98); }

        .bl-subjects { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 40px; }

        .bl-subject-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff; border: 1.5px solid #D4E8DA;
          border-radius: 100px; padding: 8px 18px;
          font-size: 14px; font-weight: 500; color: #1a2e22;
        }

        .bl-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

        /* ── FOOTER ── */
        .bl-footer {
          background: #0a1a10; padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 8px;
        }

        .bl-footer-word {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px; font-weight: 700; color: #A8D5B5;
        }

        .bl-footer p { font-size: 13px; color: rgba(255,255,255,0.22); }

        @media (max-width: 700px) {
          .bl-truth-inner { grid-template-columns: 1fr; gap: 40px; }
          .bl-steps-grid { grid-template-columns: 1fr; }
          .bl-features-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="bl">

        {/* ══ 1. HERO ══ */}
        <section className="bl-hero">
          <div className="bl-hero-inner">
            <div className="bl-eyebrow">
              <span className="bl-eyebrow-dot"></span>
              Live · Kenya · 2026
            </div>
            <h1>
              Every student deserves<br />
              to <em>see</em> the science.
            </h1>
            <p className="bl-hero-sub">
              Thousands of Kenyan students sit their KCSE practicals having
              never touched a pipette, a voltmeter, or a pendulum.
              Bina changes that — one uploaded document at a time.
            </p>
            <div className="bl-btn-row">
              <button className="bl-btn-green" onClick={() => navigate('/experiments')}>
                Try a lab now →
              </button>
              <button className="bl-btn-ghost" onClick={() => navigate('/login')}>
                I'm a teacher
              </button>
            </div>
          </div>
          <div className="bl-scroll-hint">
            <div className="bl-scroll-line"></div>
            scroll
          </div>
        </section>

        {/* ══ 2. THE TRUTH ══ */}
        <section className="bl-truth">
          <div className="bl-truth-inner">
            <div className="bl-truth-quote">
              <blockquote>
                "I walked into my first university lab and didn't know what anything was."
              </blockquote>
              <cite>— A Kenyan university student, Form 4 graduate, 2024</cite>
            </div>
            <div className="bl-truth-body">
              <h2>This is a solvable problem.</h2>
              <p>
                Most Kenyan secondary schools have no lab equipment.
                Students memorise procedures they have never performed.
                They sit exams about experiments they have never run.
              </p>
              <p>
                Bina gives every student access to a virtual lab —
                built directly from the same KNEC documents their teachers already have.
                No equipment budget required. No installation. Just a browser.
              </p>
              <div className="bl-stat-row">
                <div className="bl-stat">
                  <span className="bl-stat-n">~60%</span>
                  <span className="bl-stat-l">of schools lack labs</span>
                </div>
                <div className="bl-stat">
                  <span className="bl-stat-n">0 KES</span>
                  <span className="bl-stat-l">cost to students</span>
                </div>
                <div className="bl-stat">
                  <span className="bl-stat-n">2 min</span>
                  <span className="bl-stat-l">to generate a lab</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 3. HOW IT WORKS ══ */}
        <section className="bl-how">
          <p className="bl-section-label">How it works</p>
          <h2 className="bl-section-title">From document to lab in minutes</h2>
          <p className="bl-section-sub">Teachers upload once. Every student in Kenya gets access forever.</p>

          <div className="bl-steps-grid">
            {[
              { num:'01', icon:'📄', bg:'rgba(82,160,110,0.1)', bar:'#52A06E',
                title:'Upload any KNEC document',
                desc:'PDF, image, screenshot — Bina reads it. Physics or chemistry, Form 1 to 4.' },
              { num:'02', icon:'⚗️', bg:'rgba(244,165,53,0.1)', bar:'#F4A535',
                title:'AI builds the experiment',
                desc:'An interactive virtual lab is generated — animated, physics-accurate, playable instantly.' },
              { num:'03', icon:'🎓', bg:'rgba(58,143,183,0.1)', bar:'#3A8FB7',
                title:'Students learn by doing',
                desc:'Run trials, change variables, ask the AI tutor, take the quiz. All in the browser.' },
            ].map(s => (
              <div key={s.num} className="bl-step">
                <div className="bl-step-bar" style={{ background: s.bar }}></div>
                <span className="bl-step-num">{s.num}</span>
                <div className="bl-step-icon" style={{ background: s.bg }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 4. FEATURES ══ */}
        <section className="bl-features">
          <p className="bl-section-label" style={{ color:'#A8D5B5' }}>What's inside</p>
          <h2 className="bl-section-title" style={{ color:'#fff' }}>A full learning environment</h2>
          <p className="bl-section-sub" style={{ color:'rgba(255,255,255,0.38)' }}>
            Not just a simulation. A complete study tool.
          </p>

          <div className="bl-features-grid">
            {[
              { icon:'🔬', title:'Interactive experiments', desc:'Animated, physics-accurate simulations. Adjust variables, run trials, observe real outcomes.' },
              { icon:'🤖', title:'AI tutor — Ask Bina', desc:'Ask anything about the experiment. Every answer is grounded in the actual KNEC document.' },
              { icon:'📊', title:'Auto data tables', desc:'Results recorded automatically as you run trials. Derived values calculated instantly.' },
              { icon:'📝', title:'Built-in quiz', desc:'Concept-checking questions generated from the source document. Immediate feedback.' },
              { icon:'♾️', title:'Generated once, cached forever', desc:'Every experiment is stored. Same document — instant load for every student after the first.' },
              { icon:'📱', title:'Works on any device', desc:'Phone, tablet, school computer. No installation. No download. Just open a browser.' },
            ].map(f => (
              <div key={f.title} className="bl-feature">
                <div className="bl-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 5. CTA ══ */}
        <section className="bl-cta">
          <h2>
            No student should walk into<br />
            a lab and feel <em>lost.</em>
          </h2>
          <p>
            Start with any KNEC experiment document.
            Your first lab is ready in under two minutes.
          </p>
          <button className="bl-btn-green-lg" onClick={() => navigate('/experiments')}>
            Browse experiments →
          </button>
          <div className="bl-subjects">
            {[
              { label:'Physics', color:'#52A06E' },
              { label:'Chemistry', color:'#F4A535' },
              { label:'Biology · coming soon', color:'#3A8FB7', dim:true },
            ].map(s => (
              <span key={s.label} className="bl-subject-tag" style={{ opacity: s.dim ? 0.45 : 1 }}>
                <span className="bl-dot" style={{ background: s.color }}></span>
                {s.label}
              </span>
            ))}
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="bl-footer">
          <span className="bl-footer-word">Bina</span>
          <p>Virtual Science Labs for Kenyan Secondary Schools · © 2026</p>
          <p>Built in Nairobi 🇰🇪</p>
        </footer>

      </div>
    </>
  )
}