"use client";

import { useState } from "react";
import "./sovereign-member.css";

type ViewState = "portal" | "member" | "explorer";
type MemberMode = "login" | "register" | "recover";

export default function SovereignIdentityHallV33() {
  const [view, setView] = useState<ViewState>("portal");
  const [memberMode, setMemberMode] = useState<MemberMode>("login");

  // أمر عبور إجباري مباشر وصارم عبر المحرك الحقيقي للمتصفح لمنع أي تعليق داخلي
  const forceNavigateToVault = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("[AZMA OS] Universal Browser Route Triggered -> /sovereign-vault");
    window.location.href = '/sovereign-vault';
  };

  return (
    <main className="identity-hall">
      {/* Ambient Scene */}
      <div className="scene-grid" />
      <div className="scene-glow glow-1" />
      <div className="scene-glow glow-2" />
      <div className="scene-glow glow-3" />

      {/* Sovereign Vault Presence */}
      <div className="vault-presence">
        <div className="vault-ring ring-1" />
        <div className="vault-ring ring-2" />
        <div className="vault-ring ring-3" />
        <div className="vault-core" />
      </div>

      <section className="hall-shell">
        {/* Sovereign Tongue */}
        <div className="sovereign-tongue">
          <span>🎙 اللسان السيادي</span>
          <p>مرحباً بك، اختر مسارك للدخول إلى المنظومة.</p>
        </div>

        {/* Title */}
         {view === "portal" && (
          <header className="hall-header">
            <h1>قاعة الهوية السيادية</h1>
          </header>
        )}

        {/* ================================================= */}
        {/* PORTAL VIEW */}
        {/* ================================================= */}

        {view === "portal" && (
          <section className="portal-view">
            <button
              className="portal-card member-portal"
              onClick={() => setView("member")}
            >
              <div className="portal-shine" />

              <div className="portal-content">
                <div className="portal-icon">👑</div>

                <h2>العضو السيادي</h2>

                <p>
                  بوابة الوصول الكامل إلى الخزانة السيادية وغرف الإنتاج
                  المتخصصة.
                </p>
              </div>

              <div className="vault-hint-bg" />
            </button>

            <button
              className="portal-card explorer-portal"
              onClick={() => setView("explorer")}
            >
              <div className="portal-content">
                <div className="portal-icon">🏛</div>

                <h2>المستكشف السيادي</h2>

                <p>
                  دخول استكشافي محدود للتعرف على المنظومة قبل إنشاء الهوية
                  الكاملة.
                </p>

                <div className="explorer-points">
                   <span>  احصل على 50 نقطه </span> 
                </div>
              </div>
            </button>
          </section>
        )}

        {/* ================================================= */}
        {/* MEMBER VIEW */}
        {/* ================================================= */}

        {view === "member" && (
          <section className="member-view">
            <div className="view-topbar">
              <button
                className="back-button"
                onClick={() => setView("portal")}
              >
                ← العودة
              </button>
            </div>

            <div className="member-card">
              <div className="member-heading">
                <h2>👑 العضو السيادي</h2>
              </div>

              <div className="member-tabs">
                <button
                  className={memberMode === "login" ? "active" : ""}
                  onClick={() => setMemberMode("login")}
                >
                  تسجيل الدخول
                </button>

                <button
                  className={memberMode === "register" ? "active" : ""}
                  onClick={() => setMemberMode("register")}
                >
                  إنشاء هوية
                </button>

                <button
                  className={memberMode === "recover" ? "active" : ""}
                  onClick={() => setMemberMode("recover")}
                >
                  استعادة الهوية
                </button>
              </div>

              {memberMode === "login" && (
                <form className="sovereign-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-grid">
                    <div className="field">
                      <label>البريد الإلكتروني</label>
                      <input type="email" />
                    </div>

                    <div className="field">
                      <label>كلمة المرور</label>
                      <input type="password" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={forceNavigateToVault}
                    className="gold-button"
                  >
                    دخول سيادي
                  </button>
                </form>
              )}

              {memberMode === "register" && (
                <form className="sovereign-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-grid">
                    <div className="field full">
                      <label>الاسم الكامل</label>
                      <input type="text" />
                    </div>

                    <div className="field full">
                      <label>البريد الإلكتروني</label>
                      <input type="email" />
                    </div>

                    <div className="field">
                      <label>الدولة</label>
                      <select>
                        <option>اختر الدولة</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>رقم الهاتف</label>
                      <input type="tel" />
                    </div>

                    <div className="field">
                      <label>كلمة المرور</label>
                      <input type="password" />
                    </div>

                    <div className="field">
                      <label>تأكيد كلمة المرور</label>
                      <input type="password" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={forceNavigateToVault}
                    className="gold-button"
                  >
                    إنشاء الهوية السيادية
                  </button>
                </form>
              )}

              {memberMode === "recover" && (
                <form className="sovereign-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-grid single">
                    <div className="field">
                      <label>
                        البريد الإلكتروني أو رقم الهاتف
                      </label>
                      <input type="text" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={forceNavigateToVault}
                    className="gold-button"
                  >
                    متابعة الاستعادة
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* EXPLORER VIEW */}
        {/* ================================================= */}

        {view === "explorer" && (
          <section className="explorer-view">
            <div className="view-topbar">
              <button
                className="back-button"
                onClick={() => setView("portal")}
              >
                ← العودة
              </button>
            </div>

            <div className="explorer-card">
              <div className="explorer-heading">
                <h2>🏛 المستكشف السيادي</h2>

                <div className="explorer-points-large">
                  حصلت على 50 نقطة سيادية
                </div>
              </div>

              <form className="sovereign-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-grid">
                  <div className="field">
                    <label>الاسم</label>
                    <input type="text" />
                  </div>

                  <div className="field">
                    <label>البريد الإلكتروني</label>
                    <input type="email" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={forceNavigateToVault}
                  className="gold-button"
                >
                  ابدأ الاستكشاف
                </button>
              </form>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}