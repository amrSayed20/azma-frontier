/**
 * AZMA OS – Al-Hujjah Al-Damighah (The Sovereign Knowledge Reactor)
 * Status: Final Integrated Build (Triple Dispatch Matrix & Full Override)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './hujjah-al-damighah.css';

type SearchResult = {
  id: number;
  type: 'sacred' | 'lore' | 'empirical' | 'general';
  text: string;
  source: string;
};

const knowledgeDomains = [
  { id: 'religious', name: 'ديني (عقائدي/فقهي)', icon: '⚖️' },
  { id: 'medical', name: 'طبي (تشريحي/حديث)', icon: '🧬' },
  { id: 'scientific', name: 'علمي (فيزياء/فلك)', icon: '🔭' },
  { id: 'history', name: 'تاريخي (وثائقي/مخطوطات)', icon: '📜' },
  { id: 'culture', name: 'ثقافي (فلسفة/أدب)', icon: '🏛️' },
];

const bannedKeywords = ['سحر', 'شعوذة', 'دجل', 'جنس'];

export default function HujjahAlDamighah() {
  const router = useRouter();
  const [activeDomain, setActiveDomain] = useState('religious');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [firewallBreach, setFirewallBreach] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // Synthesis States
  const [synthesizedProof, setSynthesizedProof] = useState('');
  const [contentFormat, setContentFormat] = useState('short');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleOracleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const isBanned = bannedKeywords.some(word => searchQuery.includes(word));
    if (isBanned) {
      setFirewallBreach(true);
      setResults([]);
      return;
    }

    setFirewallBreach(false);
    setIsSearching(true);
    setResults([]);

    setTimeout(() => {
      let mockData: SearchResult[] = [];
      if (activeDomain === 'religious') {
        mockData = [
          { id: 1, type: 'sacred', text: '﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾', source: 'القرآن الكريم - سورة الحجر: 9' },
          { id: 2, type: 'lore', text: 'يُحكى أن في ذلك الزمان اجتمع القوم على أمر لم يسبقوا إليه...', source: 'مخطوطات تاريخية متفرقة' }
        ];
      } else if (activeDomain === 'medical') {
        mockData = [
          { id: 1, type: 'empirical', text: 'أثبتت الأبحاث التشريحية الحديثة أن الشبكة العصبية تتجدد وفق مسارات محددة.', source: 'دورية الطب التشريحي - 2026' }
        ];
      } else {
        mockData = [
          { id: 1, type: 'general', text: 'كل فعل في الكون يترك أثراً لا يمحى، بل يتحول إلى طاقة موازية.', source: 'أرشيف غوتنبرغ - كتاب الفلسفة الطبيعية' }
        ];
      }
      setResults(mockData);
      setIsSearching(false);
    }, 400);
  };

  const handleSynthesize = (text: string, source: string) => {
    setIsSynthesizing(true);
    
    setTimeout(() => {
      let summary = '';
      if (contentFormat === 'short') {
        summary = `[خلاصة مكثفة - سكريبت 60 ثانية]\n\nالخطاف (Hook): هل تعلم سر الخلود الحقيقي؟\n\nالحجة الدامغة: "${text}"\n(المصدر: ${source})\n\nالخاتمة: شارك هذا السر الموثق.`;
      } else if (contentFormat === 'medium') {
        summary = `[خلاصة متوسطة - فيديو 3 دقائق]\nتم مسح 7500 كتاب واستخلاص الآتي:\n\nالمقدمة: ...\n\nالحجة المركزية: "${text}" [${source}]\n\nالشرح والتحليل الموثق: ...`;
      } else {
        summary = `[بحث شامل - مقال وثائقي]\nيحتوي على تفكيك كامل للحجة المذكورة "${text}" مع ربطها بـ 4 مصادر أخرى من المكتبة لدعم الموقف السيادي...`;
      }
      
      setSynthesizedProof(summary);
      setIsSynthesizing(false);
    }, 800);
  };

  return (
    <main className="hujjah-viewport">
      <div className="top-nav-links">
        <button className="sovereign-exit-btn" onClick={() => router.push('/ras-amr')}>
          ⮜ العودة لرأس الأمر
        </button>
      </div>

      <div className="neon-layer">
        <div className="cyber-grid" />
      </div>

      <div className="chamber-grid-layout">
        
        {/* Left Wing: Domain Selector */}
        <aside className="control-panel domain-desk neon-border">
          <header className="panel-header">
            <div className="neon-tag">SECTOR SELECTOR</div>
            <h2>مسارات المعرفة</h2>
          </header>
          
          <div className="domains-container custom-scroll">
            {knowledgeDomains.map(domain => (
              <button 
                key={domain.id}
                className={`domain-btn ${activeDomain === domain.id ? 'active' : ''}`}
                onClick={() => { setActiveDomain(domain.id); setResults([]); setFirewallBreach(false); }}
              >
                <span className="domain-icon">{domain.icon}</span>
                {domain.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Center: The Oracle Viewport */}
        <section className="center-stage">
          <form className="oracle-search-form neon-border-gold" onSubmit={handleOracleSearch}>
            <input 
              type="text" 
              className="oracle-input" 
              placeholder="اكتب فكرتك السيادية... (المحرك سيقرأ 7500 كتاب ويلخصها لك)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="oracle-submit-btn" disabled={isSearching}>
              {isSearching ? 'جاري المسح...' : 'استدعاء ✨'}
            </button>
          </form>

          <div className="oracle-display custom-scroll neon-border">
            {firewallBreach ? (
              <div className="firewall-alert">
                ⚠️ [جدار الحظر السيادي]: تم رصد محتوى محظور. الاستعلام مُسقط.
              </div>
            ) : isSearching ? (
              <div className="scanning-animation">يتم مسح وتحليل آلاف المراجع في أجزاء من الثانية...</div>
            ) : results.length > 0 ? (
              <div className="results-list">
                {results.map(res => (
                  <div key={res.id} className={`result-card ${res.type}-card`}>
                    {res.type === 'lore' && <span className="lore-badge">قيل / يُحكى</span>}
                    {res.type === 'sacred' && <span className="sacred-badge">مرجعية قطعية</span>}
                    <p className="result-text">&quot;{res.text}&quot;</p>
                    <div className="result-meta">
                      <span className="result-source">المصدر: {res.source}</span>
                      <button className="extract-btn" onClick={() => handleSynthesize(res.text, res.source)}>
                        تحويل لخلاصة ⮞
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">المفاعل في وضع الاستعداد. اطرح فكرتك لاستخراج الخلاصة.</div>
            )}
          </div>
        </section>

        {/* Right Wing: Synthesis Engine & Triple Dispatch Matrix */}
        <aside className="control-panel synthesis-desk neon-border">
          <header className="panel-header">
            <div className="neon-tag">DISTILLATION ENGINE</div>
            <h2>مفاعل التلخيص والصياغة</h2>
          </header>

          <div className="format-selector">
            <label className="gold-label">حجم الإخراج المطلوب (Format):</label>
            <div className="format-tabs">
              <button className={`f-tab ${contentFormat === 'short' ? 'active' : ''}`} onClick={() => setContentFormat('short')}>Reel (60 ث)</button>
              <button className={`f-tab ${contentFormat === 'medium' ? 'active' : ''}`} onClick={() => setContentFormat('medium')}>فيديو (3 د)</button>
              <button className={`f-tab ${contentFormat === 'long' ? 'active' : ''}`} onClick={() => setContentFormat('long')}>مقال شامل</button>
            </div>
          </div>

          <div className="synthesis-workspace">
            <label className="gold-label">الكبسولة المعرفية (الخلاصة المقطرة):</label>
            <textarea 
              className="cyber-input textarea synthesis-area" 
              value={isSynthesizing ? '... جاري ضغط الـ 7500 كتاب وصياغة السكربت المطلق ...' : synthesizedProof}
              onChange={(e) => setSynthesizedProof(e.target.value)}
              placeholder="ستظهر الخلاصة الجاهزة هنا..."
            />
          </div>
          
          {/* Sovereign Dispatch Matrix (Triple Routing) */}
          <div className="dispatch-actions-grid">
            <button 
              className="route-btn push-qiyamah"
              disabled={!synthesizedProof}
              onClick={() => router.push('/qiyamah-chamber')}
            >
              <span className="btn-icon">👁️</span>
              القيامة
            </button>
            <button 
              className="route-btn push-vault"
              disabled={!synthesizedProof}
              onClick={() => router.push('/sovereign-vault-palace')}
            >
              <span className="btn-icon">👑</span>
              الخزانة
            </button>
            <button 
              className="route-btn push-makman"
              disabled={!synthesizedProof}
              onClick={() => router.push('/makman-al-ghayah')}
            >
              <span className="btn-icon">🚀</span>
              مكمن الغاية
            </button>
          </div>
        </aside>

      </div>
    </main>
  );
}
