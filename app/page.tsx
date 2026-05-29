<<<<<<< HEAD
  export default function Home() {
  return (
    <main className="relative flex  h-screen items-center justify-center overflow-hidden bg-[#050505] text-white">

      {/* الخلفية السينمائية */}
      <div className="absolute inset-0 overflow-hidden">

        {/* خلفية سوداء لامعة */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1208_0%,#050505_45%,#000000_100%)]" />

        {/* وهج ذهبي علوي */}
        <div className="absolute top-[-250px] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#ffb347]/10 blur-[160px]" />

        {/* دخان سينمائي يسار */}
        <div className="absolute left-[-10%] top-[5%] h-[700px] w-[700px] rounded-full bg-[#ffb347]/10 blur-[160px]" />

        {/* دخان سينمائي يمين */}
        <div className="absolute bottom-[0%] right-[-10%] h-[700px] w-[700px] rounded-full bg-[#ffcc70]/10 blur-[170px]" />

        {/* شرارات ذهبية */}
        <div className="absolute left-[15%] top-[20%] h-[3px] w-[3px] rounded-full bg-[#ffcc70] shadow-[0_0_25px_8px_#ffcc70]" />
        <div className="absolute right-[20%] top-[35%] h-[3px] w-[3px] rounded-full bg-[#ffb347] shadow-[0_0_25px_8px_#ffb347]" />
        <div className="absolute bottom-[18%] left-[25%] h-[3px] w-[3px] rounded-full bg-[#ffd27a] shadow-[0_0_25px_8px_#ffd27a]" />

      </div>

      {/* الإطار الإمبراطوري */}
            <section className="relative z-10 flex  min-h-[88vh] w-[94%] flex-col overflow-hidden rounded-[42px] border border-[#6f4b1d]/40  bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#090909_45%,#050505_100%)] shadow-[0_0_80px_rgba(255,179,71,0.08)] backdrop-blur-sm"> 
           {/* لمعان الحواف */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
  <div className="absolute left-[20%] top-[30%] h-[280px] w-[280px] rounded-full bg-[#ffb347]/10 blur-[120px]" />
  <div className="absolute right-[15%] bottom-[20%] h-[240px] w-[240px] rounded-full bg-[#ffffff]/5 blur-[140px]" />
</div>
        <div className="absolute inset-0 rounded-[42px] border border-[#ffb347]/10 shadow-[0_0_45px_rgba(255,179,71,0.12)]" />
 <div className="absolute inset-0 overflow-hidden pointer-events-none">

  <div className="absolute left-[10%] top-[25%] h-[350px] w-[350px] rounded-full bg-[#ffb347]/8 blur-[170px]" />

  <div className="absolute right-[12%] top-[35%] h-[280px] w-[280px] rounded-full bg-[#ffcc70]/6 blur-[150px]" />

  <div className="absolute bottom-[15%] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#ffffff]/4 blur-[180px]" />

</div>
 <div className="absolute inset-[18px] rounded-[34px] border border-[#ffb347]/12 pointer-events-none">

  <div className="absolute left-0 top-1/2 h-[1px] w-[55px] bg-[#ffcc70]/25" />

  <div className="absolute right-0 top-1/2 h-[1px] w-[55px] bg-[#ffcc70]/25" />

</div>
        
        {/* الخط العلوي الذهبي */}
        <div className="absolute left-1/2 top-0 h-[2px] w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ffb347] to-transparent opacity-80" />

        {/* الأزرار العلوية */}
        <div className="relative z-20 flex items-center justify-between px-14 pt-10">

          <button className="rounded-full border border-[#ffb347]/20 bg-[#0f0f0f]/80 px-8 py-4 text-[15px] font-semibold text-[#ffcc70] shadow-[0_0_25px_rgba(255,179,71,0.12)] transition duration-300 hover:border-[#ffcc70]/60 hover:shadow-[0_0_35px_rgba(255,179,71,0.25)]">
            شوف عظمة (عرض توضيحي)
          </button>

          <button className="rounded-full border border-[#ffb347]/20 bg-[#0f0f0f]/80 px-8 py-4 text-[15px] font-semibold text-[#ffcc70] shadow-[0_0_25px_rgba(255,179,71,0.12)] transition duration-300 hover:border-[#ffcc70]/60 hover:shadow-[0_0_35px_rgba(255,179,71,0.25)]">
            لسان العظمة (اللغة)
          </button>

        </div>

        {/* المحتوى الأوسط */}
         <div className="relative flex flex-1 flex-col items-center justify-start pt-6 px-8 text-center">
          {/* لوحة الاسم */}
          <div className="relative mb-2 -mt-12">

            {/* توهج */}
            <div className="absolute inset-0 scale-110 rounded-[30px] bg-[#ffb347]/20 blur-[70px]" />
<div className="absolute left-1/2 -top-8 -translate-x-1/2 text-[42px] text-[#ffcc70] opacity-80">
  ✦
</div>
            {/* الإطار */}
             <div className="relative overflow-hidden rounded-[36px] border-2 border-[#d9a441]/70 bg-gradient-to-b from-[#7c5320] via-[#2f1a09] to-[#090909] px-20 py-3 shadow-[0_0_80px_rgba(255,179,71,0.45)]">
<div className="absolute inset-[4px] rounded-[32px] border border-[#ffdd99]/30"></div>
              {/* لمعان داخلي */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,245,210,0.55)_0%,rgba(255,210,120,0.18)_25%,rgba(255,170,60,0.05)_55%,rgba(0,0,0,0.30)_100%)]" />

              {/* النص */}
<h1 className="relative text-[58px] font-black tracking-[8px] text-[#ffd27a] drop-shadow-[0_0_20px_rgba(255,200,120,0.50)]">
 <div className="relative mt-2 text-center text-[#ffcc70]/70 text-[22px]">
  ✦
</div>
  AZMA OS
</h1>
            </div>
          </div>
         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ffcc70]/70 text-[26px]">
 ✦
</div>

<div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffcc70]/70 text-[26px]">
 ✦
</div>
          {/* النص العربي */}
            <div className="relative mb-8">

            <p className="text-[24px] font-bold leading-[1.9]  text-[#ffe8b0] drop-shadow-[0_0_10px_rgba(255,220,150,0.15)]">
              حَيْثُ يُصْهَرُ الإبداعُ والرؤيةُ الفنيةُ في بوتقةِ التجسيدِ البصري.
            </p>

            <p className="text-[24px] font-bold leading-[1.9]  text-[#ffe8b0] drop-shadow-[0_0_10px_rgba(255,220,150,0.15)]">
              لتحقيقِ السيادةِ الرقميةِ بالحجةِ الدامغة.
            </p>

          </div>

          {/* فاصل زخرفي */}
          <div className="my-6 h-[2px] w-[240px] bg-gradient-to-r from-transparent via-[#ffb347] to-transparent opacity-70" />
<div className="flex items-center justify-center gap-3 mt-2"> 
          {/* زر البوابة */}
          <button className="group relative overflow-hidden rounded-full border border-[#ffcc70]/40 bg-[#0d0d0d]/90   px-8 py-3 text-[20px] font-bold text-[#f7d089] shadow-[0_0_35px_rgba(255,179,71,0.16)] transition duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,179,71,0.35)]">

              <span className="relative z-10 flex items-center gap-2">

  <span  className="text-[18px]">
    👑
  </span>

  <span>
    البوابة السيادية
  </span>

</span>

            {/* لمعان متحرك */}
            <div className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,transparent,rgba(255,220,150,0.18),transparent)] transition duration-1000 group-hover:translate-x-[120%]" />

          </button>
<button className="group relative   overflow-hidden rounded-full border border-[#ffcc70]/30 bg-[#0d0d0d]/80 px-8 py-3 text-[20px] font-bold text-[#f7d089] shadow-[0_0_25px_rgba(255,179,71,0.12)] transition duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,179,71,0.25)]">

   <span className="relative z-10 flex items-center gap-2">

  <span className="text-[18px]">
    📱
  </span>

  <span>
    التثبيت الإمبراطوري
  </span>

</span>

  <div className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,transparent,rgba(255,220,150,0.14),transparent)] transition duration-1000 group-hover:translate-x-[120%]" />

</button>
        </div>
</div>
=======
 export default function HomePage() {
  return (
    <main className="azma-root">

      <div className="gold-core" />

      <section className="main-area">

        <header className="topbar">

          <h2 className="logo">
            AZMA <span>OS</span>
          </h2>

          <div className="top-actions">
            <button className="glass-btn">
              Documentation
            </button>

            <button className="glass-btn">
              Launch System
            </button>
          </div>

        </header>

        <section className="hero-center">

          <div className="hero-box">

            <h1 className="hero-title">
              The Future Of
              <br />
              Intelligent <span>Operating Systems</span>
            </h1>

            <p className="hero-subtitle">
              AZMA OS is a cinematic futuristic interface
              built to merge artificial intelligence,
              elegant visuals, and next-generation system control
              into one immersive experience.
            </p>

            <button className="main-btn">
              Enter AZMA OS
            </button>

          </div>

        </section>

>>>>>>> 92042d5baeb033b2e47bc7d9f8fb04cc376b332e
      </section>

    </main>
  );
}