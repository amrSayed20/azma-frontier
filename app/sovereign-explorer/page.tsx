import "./sovereign-explorer.css";

export default function SovereignExplorerPage() {
  return (
    <main className="explorer-page">

      <div className="explorer-layout">

        {/* LEFT */}

        <aside className="left-rail">

          <button className="side-node biometric">
            <span className="node-icon">👁</span>
            <span className="node-title">بصمة الوجه</span>
          </button>

          <button className="side-node biometric">
            <span className="node-icon">✋</span>
            <span className="node-title">بصمة الإصبع</span>
          </button>

        </aside>

        {/* CENTER */}

        <section className="gate-zone">

          <div className="gate-door">

            <div className="gate-glow"></div>

            <span className="gate-label">
              المستكشف السيادي
            </span>

            <h1>
              بوابة التفعيل السيادي
            </h1>

            <p>
              فعّل هويتك البيومترية لتحصل على
              50 بذرة سيادية وتبدأ رحلتك داخل عظمة.
            </p>

            <button className="activate-btn">
              تفعيل الهوية السيادية
            </button>

          </div>

        </section>

        {/* RIGHT */}

        <aside className="right-rail">

          <div className="journey-title">
            رحلة المستكشف
          </div>

          <button className="side-node room">
            <span className="node-title">
              الحجة الدامغة
            </span>

            <span className="node-desc">
              استكشاف الأفكار والبحث المصغر
            </span>
          </button>

          <button className="side-node room">
            <span className="node-title">
              حجرة القيامة
            </span>

            <span className="node-desc">
              إنشاء المحتوى والتجارب
            </span>
          </button>

          <button className="side-node room">
            <span className="node-title">
              رأس الأمر
            </span>

            <span className="node-desc">
              مشاهدة دورة الإنتاج
            </span>
          </button>

          <button className="side-node room">
            <span className="node-title">
              مكمن الغاية
            </span>

            <span className="node-desc">
              تصدير المنتجات
            </span>
          </button>

        </aside>

      </div>

    </main>
  );
}