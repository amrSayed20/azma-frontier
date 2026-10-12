# AZMA OS — جردُ المزوّدين والنماذج · ما يُنفَّذ فعلاً في حجرة القيامة

> **التاريخ:** 2026-10-12 · **الإصدارُ الحيّ وقتَ الجرد:** `20261012-145654-864a104`
> **قاعدةُ الصدق التي حَكمَت كلّ سطر:** مُحوِّلٌ ليس برهانَ قدرةٍ إنتاجيّة · نموذجٌ
> مُهيَّأ ليس برهانَ استحقاق · اختبارٌ يَمرّ ليس برهانَ نتيجةٍ حيّة.
> **ولم يُستنتَج مزوّدٌ من اسم واجهةٍ ولا من اسم مُحوِّلٍ ولا من متغيّر بيئة:** كلُّ
> سطرٍ أدناه مأخوذٌ من الشفرة المُنفَّذة، أو من سجلّ إرسالٍ حقيقيّ على الخادم، أو من
> خصمٍ مقيسٍ من المزوّد.

---

## أوّلاً: المصفوفة — عشرُ عمليّات

| # | ما يَراه المُنشئ | المعرّف الداخليّ | المزوّد · الوجهة | النموذج/الوضع المُرسَل فعلاً | كيف تَثبُت التهيئة | الحالة |
|---|---|---|---|---|---|---|
| ١ | صورة | `image` | `magic-hour` · `/v1/ai-image-generator` | `nano-banana-2` | **اختيارٌ ديناميّ** من مجموعةٍ عضوُها واحد | **MULTIPLE CANDIDATES / DYNAMIC SELECTION** |
| ٢ | إنفوغرافيك | `infographic` | `magic-hour` · `/v1/ai-image-generator` | `nano-banana-2` | **مُلزَم** بـ`STYLE_REQUIRED_MODEL_MAP` | **PINNED** · مُثبَتٌ تاريخيّاً |
| ٣ | فيديو | `video` | `magic-hour` · `/v1/text-to-video` | `minimax-h3` | **مُلزَم** بـ`requiredModelId` | **PINNED** · مُثبَتٌ تاريخيّاً |
| ٤ | تعديل | `edit` | `magic-hour` · `/v1/ai-image-editor` | `nano-banana-2` | **ثابتٌ في المُحوِّل** `IMAGE_EDIT_MODEL_ID` | **PINNED** · مُثبَتٌ تاريخيّاً |
| ٥ | تحريك | `animate` | `magic-hour` · `/v1/image-to-video` | `veo3.1` | **مجموعةُ مرشّحين** يَختار منها المُنشئ، ويُصفّيها المُنتقي | **CANDIDATE SET (عضوٌ واحد اليوم)** |
| ٦ | رفعُ الدقّة ×٢ | `upscale` | `magic-hour` · `/v1/ai-image-upscaler` | لا نموذج · `scale_factor:2` · `mode:'preserve'` | **ثوابتُ مُحوِّل** | **PINNED & PRODUCTION-PROVEN** |
| ٦ب | رفعُ الدقّة ×٤ | `upscale` | نفسها | `scale_factor:4` · `mode:'preserve'` | **ثابتٌ + وسيطٌ مُقيَّد** | **PINNED & PRODUCTION-PROVEN اليوم** · بلا سعرٍ للمُنشئ |
| ٧ | إزالةُ الخلفيّة | `background-removal` | `magic-hour` · `/v1/image-background-remover` | لا نموذج · وضعٌ واحد | **وجهةٌ ثابتة** | **PINNED** · كلفتُه **مقيسةٌ اليوم** · ما زال موقوفاً للمُنشئ |
| ٨ | صورةٌ ناطقة | `talking-photo` | `magic-hour` · `/v1/ai-talking-photo` | `style.generation_mode='realistic'` | **ثابتُ مُحوِّل** | **PINNED** · كلفتُه **مقيسةٌ اليوم** · موقوفٌ للمُنشئ |
| ٩ | مزامنةُ الشفاه | `lip-sync` | `magic-hour` · `/v1/lip-sync` | `style.generation_mode='standard'` | **ثابتُ مُحوِّل** | **PINNED** · كلفتُه **مقيسةٌ اليوم** · موقوفٌ للمُنشئ |
| ١٠ | تبديلُ الوجه | `face-swap` | `magic-hour` · `/v1/face-swap` | `style.version='default'` · `face_swap_mode='all-faces'` | **ثوابتُ مُحوِّل** | **PINNED** · كلفتُه **مقيسةٌ اليوم** · موقوفٌ للمُنشئ · ويَلزمه إقرار |

**لا عمليّةَ واحدةً من العشر لها برهانُ تشغيلٍ إنتاجيٍّ على الإصدار الحيّ قبل
اليوم.** وما ثَبت اليوم ثَبت على إصدارين من إصدارات اليوم نفسِه، وهو مذكورٌ لكلّ
صفٍّ في القسم الثالث.

---

## ثانياً: دليلُ كلّ تعيين — من الشفرة ومن السجلّ

### ١ · صورة — اختيارٌ ديناميّ، لا تثبيت

- **الشفرة:** `generation-service.ts` → `getProductionSelector().select(creationIntent)`
  · لا `requiredModelId` إلّا للإنفوغرافيك · `magic-hour-adapter.ts:275` يُرسل
  `model: modelToUse` إلى `/v1/ai-image-generator`.
- **المجموعةُ المسموحة:** `sovereign-model-registry.ts:67` →
  `productionAuthorized && active`. وفي `IMAGE_MODEL_FLEET` اليوم عضوٌ واحد:
  `nano-banana-2`. والأربعةُ الباقون (`z-image-turbo`, `seedream-4`,
  `seedream-4-5`, `nano-banana-pro`) **غيرُ مُصرَّحٍ بهم**.
- **سجلٌّ حيٌّ من الخادم:**
  `[SovereignGeneration] model-selection {"modelId":"nano-banana-2","providerModelId":"nano-banana-2","resolution":"1k"}`
  و`[MagicHourImageAdapter] job-submitted {"model":"nano-banana-2"}`.
- **وسجلٌّ أقدمُ يُثبِت أنّ التعيين ليس ثابتاً:**
  `[MagicHourImageAdapter] dispatch {"model":"nano-banana-pro"}` — حين كان ذلك
  النموذجُ مُصرَّحاً به. فالثباتُ اليومَ ناتجٌ عن **تركيب المجموعة**، لا عن تثبيت:
  رفعُ علمٍ واحدٍ على نموذجٍ آخر يُعيد الاختيارَ ديناميّاً في اللحظة نفسِها.
- **⚠ خطرٌ مقيسٌ في الشفرة:** `magic-hour-adapter.ts:266`

      const modelToUse = selectedProviderModelId ?? MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL;

  و`MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL = 'flux-schnell'` — **وهو ليس عضواً في
  الأسطول أصلاً**، لا مُصرَّحاً ولا غيرَ مُصرَّح. فأيُّ نداءٍ يَصل بلا
  `providerModelId` يُرسِل نموذجاً لم يَحكم فيه أحد. مسارُ التوليد اليومَ يَرفض
  قبل ذلك (أُغلق في 8d9b407)، فالخطرُ كامنٌ لا واقع — **ويُزال بسطرٍ واحد.**

### ٢ · إنفوغرافيك — مُلزَم

`intent-builder.ts:36` → `STYLE_REQUIRED_MODEL_MAP = { infographic: 'nano-banana-2' }`
و`sovereign-model-selector.ts:88` يُصفّي المجموعةَ بـ`requiredModelId` **أو يَرفض**
— لا استبدال. سجلٌّ حيّ: `"style":"infographic"` مع `modelId: nano-banana-2`.

### ٣ · فيديو — مُلزَم

`generation-service.ts:598` → `requiredModelId: QIYAMAH_VIDEO_GENERATION_MODEL`
و`video-model-fleet.ts:41` → `'minimax-h3'`. سجلٌّ حيّ:
`[SovereignGeneration] video-model-selection {"modelId":"minimax-h3","providerModelId":"minimax-h3"}`.
**ولولا هذا الإلزام لكان في المجموعة عضوان** (`veo-3-1` و`minimax-h3`) ولَحسم
الترتيبُ في المصفوفة الفائز — وهو ما يَقوله تعليقُ الشفرة نفسُه.

### ٤ · تعديل — ثابتٌ في المُحوِّل

`magic-hour-image-editing.ts:170` → `IMAGE_EDIT_MODEL_ID = 'nano-banana-2'`،
ويُرسَل في `body.model`. والمُحوِّلُ يَقبل `options.model` كبديلٍ صريح، ولا
يُمرِّره أيُّ نداءٍ إنتاجيّ اليوم.

### ٥ · تحريك — مجموعةُ مرشّحين، والمُنشئُ يَختار

- `page.tsx` يَشتقّ ما يُعرَض من الأسطول:
  `productionAuthorized && m.active && m.supportsImageToVideo === true` → اليوم
  `veo-3-1` وحده.
- البابُ `/animate` **لا يَثق بما يُرسله المتصفّح**: يُمرّر الاختيارَ إلى
  `buildAnimationIntent(...)` كـ`requiredModelId`، فيُصفّي المُنتقي **المجموعةَ
  المُصرَّح بها** به. فمعرّفٌ غيرُ مُصرَّحٍ به لا يُنفَّذ — يُرَدّ بلا اختيار.
- والمُحوِّلُ يَرفض الإرسالَ بلا نموذج: `if (!options.providerModelId) throw`.

### ٦ · رفعُ الدقّة

`UPSCALE_SCALE_FACTOR = 2` · `UPSCALE_MODE = 'preserve'` · والمعامِلُ صار وسيطاً
مُقيَّداً بـ`2|4`. و**لا نموذجَ يُرسَل** — ولذلك يُسجَّل في النسب
`mutationProviderModelId: 'ai-image-upscaler'` بوصفه الوجهةَ لا نموذجاً.

### ٧–١٠ · الأفعالُ الأربعة

`magic-hour-creative-operations.ts`: `CREATIVE_ENDPOINT` يُثبّت الوجهات،
و`LIP_SYNC_GENERATION_MODE='standard'` · `TALKING_PHOTO_GENERATION_MODE='realistic'`
· `FACE_SWAP_STYLE_VERSION='default'` · `FACE_SWAP_FACE_MODE='all-faces'` تُرسَل
**صراحةً** في كلّ طلب. ولا نموذجَ لهذه الوجهات: الوجهةُ هي النموذج.

---

## ثالثاً: الكلفةُ والاستحقاق — ما قِيس اليوم، وما لم يُقَس

| العمليّة | سلطةُ السعر للمُنشئ | كلفةُ المزوّد | كيف عُرفت | برهانٌ حيٌّ على إصدار اليوم |
|---|---|---|---|---|
| صورة | `IMAGE_GENERATION` 200 وحدة/صورة | ١٠٠ وحدة | مستندٌ + خصمٌ تاريخيّ | **لا** |
| إنفوغرافيك | `INFOGRAPHIC` 200 | ١٠٠ | نفسه | **لا** |
| فيديو | `VIDEO_GENERATION` 200/ثانية | ٤٨/ث عند 720p | مستند | **لا** |
| تعديل | `IMAGE_EDIT` 200 | ١٠٠ | مستند | **لا** |
| تحريك | `MOTION` 200/ثانية | ٩٦/ث عند 720p | مستند | **لا** |
| رفعُ الدقّة ×٢ | `UPSCALE_2X` 50/عمليّة | **٢٥ مقيسة** | فاتورةُ 2026-09-27 | **لا** |
| رفعُ الدقّة ×٤ | **لا سعرَ** | **١٠٠ مقيسة** | وظيفةُ اليوم · `cmv5c2l8q073…` | **نعم** — `5ffced5` |
| إزالةُ الخلفيّة | **لا سعرَ** | **٥ لكلّ صورة، مقيسة مرّتين** | وظيفتا اليوم | **نعم** — `5b1ae10` |
| صورةٌ ناطقة | **لا سعرَ** | **٤٨ لكلّ ثانية، مقيسة** | وظيفتا اليوم | **نعم** — `5ffced5` |
| مزامنةُ الشفاه | **لا سعرَ** | **١ لكلّ إطار، مقيسة** | وظيفتا اليوم | **نعم** — `5ffced5` |
| تبديلُ الوجه | **لا سعرَ** | **١ لكلّ إطار، مقيسة** | وظيفتا اليوم | **نعم** — `5ffced5` |

> **الإصدارُ الحيُّ الآن `864a104` يَختلف عن `5ffced5` في ثلاثة ملفّاتٍ فقط:**
> مكوّنُ الحجرة في المتصفّح، واختبارٌ، وأداةُ المشي. **لا مسارَ تنفيذٍ واحدٌ تغيّر**،
> فالقياساتُ أعلاه تَسري على ما هو منشورٌ الآن.

---

## رابعاً: المانيفست المقترَح — تثبيتٌ صريحٌ مُدارٌ بالإصدار

**لم يُنفَّذ.** هذا اقتراحٌ يَنتظر إذناً منفصلاً، كما نَصّ أمرُك.

```
QIYAMAH_PROVIDER_MANIFEST  ·  version 1.0  ·  2026-10-12

image             magic-hour  /v1/ai-image-generator       nano-banana-2      FIXED
infographic       magic-hour  /v1/ai-image-generator       nano-banana-2      FIXED (style-required)
video             magic-hour  /v1/text-to-video            minimax-h3         FIXED (required-model)
edit              magic-hour  /v1/ai-image-editor          nano-banana-2      FIXED
animate           magic-hour  /v1/image-to-video           { veo-3-1 }        CANDIDATE SET · the Creator chooses · the selector filters
upscale-2x        magic-hour  /v1/ai-image-upscaler        scale 2 · preserve FIXED
upscale-4x        magic-hour  /v1/ai-image-upscaler        scale 4 · preserve FIXED · NOT OFFERED (no creator price)
background-removal magic-hour /v1/image-background-remover  —                 FIXED
talking-photo     magic-hour  /v1/ai-talking-photo         realistic          FIXED
lip-sync          magic-hour  /v1/lip-sync                 standard           FIXED
face-swap         magic-hour  /v1/face-swap                default·all-faces  FIXED · requires the likeness declaration
```

**ما يَحكُمه المانيفست، وما لا يَحكُمه:**

- يَحكُم: أيُّ وجهةٍ وأيُّ نموذجٍ وأيُّ وضعٍ يُرسَل لكلّ عمليّة، ومَن يَختار حين
  تكون هناك مجموعةُ مرشّحين، وسياسةُ ذلك الاختيار.
- لا يَحكُم: السعرَ للمُنشئ (سلطةُ `sovereign-value-balance`)، ولا هويّةَ الأصل
  السياديّ (لا يُكتَب اسمُ مزوّدٍ في هويّة أصل)، ولا نصّاً يَقرؤه مُنشئ.
- **لا يُبدِّل مزوّداً صامتاً:** تغييرُ أيّ سطرٍ فيه تغييرُ شفرةٍ بإصدارٍ مُسجَّل.
- **لا يُفعِّل عمليّةً** ينقصها تصريحٌ أو استحقاقٌ أو سياسةٌ أو سعر.

### أصغرُ خطّةِ تنفيذٍ تَفرضه (خمسُ خطوات، بلا تغيير سلوك)

١. **`src/sovereign-model-selection/qiyamah-provider-manifest.ts`** — الجدولُ أعلاه
   بوصفه بياناتٍ مُصدَّرة، بإصدارٍ وتاريخ. **لا يُنفّذ شيئاً بعد.**
٢. **اختبارُ ارتباط** يَربط كلّ سطرٍ بالسلطة التي تُنفّذه فعلاً:
   `IMAGE_EDIT_MODEL_ID` · `QIYAMAH_VIDEO_GENERATION_MODEL` ·
   `STYLE_REQUIRED_MODEL_MAP` · ثوابتُ الأوضاع الأربعة · `CREATIVE_ENDPOINT`.
   فإن تغيّر أحدُهما بلا الآخر سقط الاختبار. **هذه الخطوةُ وحدها تُثبِّت التعيين
   دون أن تُغيّر سطرَ تنفيذٍ واحد.**
٣. **إزالةُ الاحتياطيّ الخطِر:** `?? MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL` يُستبدَل
   برفضٍ صريح. نداءٌ بلا نموذجٍ مُختارٍ يَجب أن يَفشل، لا أن يَختار عن الإمبراطوريّة.
٤. **تثبيتُ الصورة** بـ`requiredModelId` كما فُعل بالفيديو — فلا يَعود الثباتُ
   معتمداً على أنّ المجموعةَ عضوُها واحد.
٥. **اختبارُ مجموعةِ التحريك:** كلُّ مرشّحٍ يُعرَض لا بدّ أن يَكون
   `productionAuthorized && active && supportsImageToVideo`، وأن يَمرّ بالمُنتقي.

الخطواتُ ١ و٢ و٥ **لا تُغيّر سلوكَ تنفيذٍ البتّة** ويُمكن تثبيتُها بأمان اليوم.
والخطوتان ٣ و٤ **تُغيّران سلوكاً في حالةِ خطأ** (نداءٌ بلا نموذج)، فتَحتاجان
إذناً وإصداراً.

---

## خامساً: التعييناتُ الناقصةُ أو المتناقضة، والموانع

| ما هو | الحال |
|---|---|
| `flux-schnell` احتياطيّاً | **متناقض:** نموذجٌ خارج الأسطول يُمكن إرسالُه في حالة نقصٍ — كامنٌ لا واقع |
| تثبيتُ الصورة | **ناقص:** الثباتُ من تركيب المجموعة لا من إلزام |
| دقّةُ الصورة | المُعلَن `ultra ⇒ 2k`، والمُرسَلُ في السجلّ الحيّ `1k` — **تعارضٌ يَستحقّ حكماً** |
| سعرُ ×٤ للمُنشئ | **مانع:** الكلفةُ مقيسةٌ (١٠٠) ولا سعرَ مُقرّ |
| سعرُ الأفعال الأربعة | **مانع:** الكلفُ مقيسةٌ كلُّها، ولا سعرَ مُقرّ — ولذلك تَبقى موقوفة |
| بندُ الشبيه في الوثائق | مُدمَجٌ ومنشورٌ على الإصدار الحيّ (الشروط 1.2) |
| سياسةُ الاسترداد بالعربيّة | **مانعُ جاهزيّة:** منشورةٌ بالإنجليزيّة |
| دقّةُ مخرجات الفيديو | المزوّدُ يُعيد **576p** عن مصدرٍ 1080p في المزامنة وتبديل الوجه — **قدرةٌ محدودةٌ مقيسة** |
| طولُ الطلب | عمليّاتُ الفيديو تَتجاوز مهلةَ الحافّة (100s) — **مانعٌ تجريبيٌّ لواجهة المُنشئ** |
