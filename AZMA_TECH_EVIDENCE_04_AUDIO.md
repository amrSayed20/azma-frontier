# AZMA Technology Evidence Collection 04

## Domain
Audio and Speech Ecosystem

## Scope Statement
Evidence-only collection using primary sources (official documentation, official developer docs, official repositories/model cards, official release notes/pages).

## Fixed Research Areas (Applied to Every Family)
1. Text-to-Speech (TTS)
2. Speech-to-Text (STT)
3. Voice Cloning
4. Voice Conversion (Speech-to-Speech)
5. Realtime Conversational Audio
6. Music Generation
7. Sound Effects (SFX) Generation
8. Audio Editing/Transformation
9. Audio Enhancement/Isolation
10. Realtime Streaming/Low-Latency Operations

## Source Index
- S1: OpenAI Audio and Speech Concepts: https://developers.openai.com/api/docs/guides/audio
- S2: OpenAI Realtime and Audio Overview: https://developers.openai.com/api/docs/guides/realtime
- S3: OpenAI Text-to-Speech Guide: https://developers.openai.com/api/docs/guides/text-to-speech
- S4: OpenAI Speech-to-Text Guide: https://developers.openai.com/api/docs/guides/speech-to-text
- S5: Google Gemini TTS Guide: https://ai.google.dev/gemini-api/docs/speech-generation
- S6: Google Gemini Audio Understanding: https://ai.google.dev/gemini-api/docs/audio
- S7: Google Lyria 3 Music Generation: https://ai.google.dev/gemini-api/docs/music-generation
- S8: Google Lyria RealTime Music: https://ai.google.dev/gemini-api/docs/realtime-music-generation
- S9: Microsoft Azure Speech Overview: https://learn.microsoft.com/azure/ai-services/speech-service/overview
- S10: ElevenLabs Text-to-Speech Capability: https://elevenlabs.io/docs/overview/capabilities/text-to-speech
- S11: ElevenLabs Speech-to-Text Capability: https://elevenlabs.io/docs/overview/capabilities/speech-to-text
- S12: ElevenLabs Voice Changer Capability: https://elevenlabs.io/docs/overview/capabilities/voice-changer
- S13: ElevenLabs Voices Capability (Cloning/Design/Remixing): https://elevenlabs.io/docs/overview/capabilities/voices
- S14: ElevenLabs Sound Effects Capability: https://elevenlabs.io/docs/overview/capabilities/sound-effects
- S15: ElevenLabs Speech Engine (Realtime Voice Agent Layer): https://elevenlabs.io/docs/overview/capabilities/speech-engine
- S16: Deepgram Documentation Index (official llms index): https://developers.deepgram.com/llms.txt
- S17: Deepgram STT Getting Started: https://developers.deepgram.com/docs/stt/getting-started.md
- S18: Deepgram TTS Getting Started: https://developers.deepgram.com/docs/text-to-speech
- S19: Stability AI Stable Audio Product Page: https://stability.ai/stable-audio
- S20: Stability AI Stable Audio Open 1.0 Official Model Card: https://huggingface.co/stabilityai/stable-audio-open-1.0

## Family Evidence

### 1) OpenAI Audio and Realtime Family
- Text-to-Speech (TTS): Explicit via speech endpoint and models (`gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`), with built-in voices and output formats. [S3]
- Speech-to-Text (STT): Explicit via transcriptions and translations endpoints; models include `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe-diarize`, `whisper-1`. [S4]
- Voice Cloning: Explicit custom voices workflow with consent recording, sample upload, and org-level limits. [S3]
- Voice Conversion (Speech-to-Speech): Speech-to-speech is documented as a realtime task class; dedicated voice conversion API workflow is not explicitly documented in retrieved sources. [S1][S2]
- Realtime Conversational Audio: Explicit via realtime voice-agent sessions on `/v1/realtime`, with WebRTC/WebSocket/SIP connection methods. [S2]
- Music Generation: UNKNOWN in retrieved official OpenAI audio/speech sources. [S1][S2][S3][S4]
- SFX Generation: UNKNOWN in retrieved official OpenAI audio/speech sources. [S1][S2][S3][S4]
- Audio Editing/Transformation: Explicit for transcription-side controls (diarization, timestamps, prompts); explicit destructive waveform editing workflow is UNKNOWN. [S4]
- Audio Enhancement/Isolation: UNKNOWN in retrieved official OpenAI audio/speech sources.
- Realtime Streaming/Low-Latency Operations: Explicit streaming patterns for TTS, realtime sessions, live transcript deltas, and translation sessions. [S2][S3][S4]

### 2) Google Gemini Audio and Lyria Family
- Text-to-Speech (TTS): Explicit Gemini TTS support for single-speaker and multi-speaker output, voice configuration, and style prompting. [S5]
- Speech-to-Text (STT): Explicit audio understanding support for transcription and translation, with timestamp-oriented prompting patterns. [S6]
- Voice Cloning: UNKNOWN in retrieved official Gemini audio/TTS/Lyria sources.
- Voice Conversion (Speech-to-Speech): UNKNOWN as a dedicated conversion endpoint in retrieved sources.
- Realtime Conversational Audio: Live API is identified for real-time voice/video interactions; full speech-agent control model details are outside retrieved excerpts. [S6][S5]
- Music Generation: Explicit via Lyria 3 Clip and Pro models, including prompt-driven full songs/clips. [S7]
- SFX Generation: UNKNOWN as a dedicated SFX API in retrieved sources.
- Audio Editing/Transformation: Music control by timestamps/structure and real-time steering are explicit for Lyria; generalized post-generation waveform editing API is UNKNOWN. [S7][S8]
- Audio Enhancement/Isolation: UNKNOWN in retrieved official sources.
- Realtime Streaming/Low-Latency Operations: Explicit realtime streaming music generation over WebSocket using Lyria RealTime. [S8]

### 3) Microsoft Azure Speech Family
- Text-to-Speech (TTS): Explicit neural voices and SSML controls; custom voice is documented. [S9]
- Speech-to-Text (STT): Explicit real-time, fast, and batch transcription offerings; custom speech models are documented. [S9]
- Voice Cloning: Explicit as custom voice capability (private custom voices) with responsible AI and limited-access governance references. [S9]
- Voice Conversion (Speech-to-Speech): Speech translation (speech-to-speech / speech-to-text translation) is explicit; direct voice-conversion workflow is UNKNOWN in retrieved source. [S9]
- Realtime Conversational Audio: Explicit Voice Live capability for human-agent conversational interfaces. [S9]
- Music Generation: UNKNOWN in retrieved official Azure Speech overview.
- SFX Generation: UNKNOWN in retrieved official Azure Speech overview.
- Audio Editing/Transformation: UNKNOWN as a dedicated audio-editing API in retrieved source.
- Audio Enhancement/Isolation: UNKNOWN in retrieved official Azure Speech overview.
- Realtime Streaming/Low-Latency Operations: Explicit real-time transcription and speech translation scenarios; deployment to cloud/containers/sovereign environments is documented. [S9]

### 4) ElevenLabs Audio Family
- Text-to-Speech (TTS): Explicit API capability with model tiers (including low-latency Flash), multilingual support, and streaming output patterns. [S10]
- Speech-to-Text (STT): Explicit STT capability (Scribe family), realtime model, diarization, timestamps, keyterm prompting, and broad language coverage. [S11]
- Voice Cloning: Explicit instant and professional cloning pathways in voice capability docs. [S13]
- Voice Conversion (Speech-to-Speech): Explicit voice changer API preserving performance nuance and emotional cues. [S12]
- Realtime Conversational Audio: Explicit Speech Engine architecture over WebSocket for STT->LLM->TTS voice loops and interruption handling. [S15]
- Music Generation: Mentioned in platform and API surfaces, but detailed official capability evidence was not retrieved in this source subset; classification remains UNKNOWN for detailed technical scope. [S10]
- SFX Generation: Explicit text-to-sound-effects API, duration/looping controls, and output constraints. [S14]
- Audio Editing/Transformation: Explicit word/phrase replacement use case in voice changer and prompt-driven transformation patterns. [S12]
- Audio Enhancement/Isolation: UNKNOWN in retrieved official evidence set for explicit enhancement/isolation capability details.
- Realtime Streaming/Low-Latency Operations: Explicit low-latency claims and realtime speech pathways across TTS/STT/Speech Engine. [S10][S11][S15]

### 5) Deepgram Speech and Voice Agent Family
- Text-to-Speech (TTS): Explicit TTS REST and streaming/WebSocket pathways in official docs index and getting-started pages. [S16][S18]
- Speech-to-Text (STT): Explicit pre-recorded, live streaming, and turn-based Flux pathways in official docs index and STT getting-started page. [S16][S17]
- Voice Cloning: UNKNOWN in retrieved official Deepgram sources.
- Voice Conversion (Speech-to-Speech): UNKNOWN as a dedicated conversion API in retrieved sources.
- Realtime Conversational Audio: Explicit Voice Agent API documentation and architecture references in official docs index. [S16]
- Music Generation: UNKNOWN in retrieved official Deepgram sources.
- SFX Generation: UNKNOWN in retrieved official Deepgram sources.
- Audio Editing/Transformation: UNKNOWN as a dedicated waveform editing API in retrieved sources.
- Audio Enhancement/Isolation: UNKNOWN in retrieved official Deepgram sources.
- Realtime Streaming/Low-Latency Operations: Explicit live streaming STT and streaming TTS docs, plus WebSocket API references. [S16][S17][S18]

### 6) Stability Stable Audio Family
- Text-to-Speech (TTS): UNKNOWN in retrieved official Stable Audio sources.
- Speech-to-Text (STT): UNKNOWN in retrieved official Stable Audio sources.
- Voice Cloning: UNKNOWN in retrieved official Stable Audio sources.
- Voice Conversion (Speech-to-Speech): UNKNOWN in retrieved official Stable Audio sources.
- Realtime Conversational Audio: UNKNOWN in retrieved official Stable Audio sources.
- Music Generation: Explicit Stable Audio family positioning for music generation; model card states text-to-audio generation and duration/sampling constraints for Stable Audio Open 1.0. [S19][S20]
- SFX Generation: Explicit mention of SFX-oriented variants/use cases in Stable Audio family messaging and model limitations noting strengths in sound effects/field recordings. [S19][S20]
- Audio Editing/Transformation: Product page references segment modification/rework/extension controls; technical API specifics not fully extracted in retrieved sources. [S19]
- Audio Enhancement/Isolation: UNKNOWN in retrieved official Stable Audio sources.
- Realtime Streaming/Low-Latency Operations: UNKNOWN in retrieved official Stable Audio sources.

## Cross-Family Evidence Notes
- Realtime voice interaction evidence is strongest in OpenAI Realtime, Azure Voice Live, ElevenLabs Speech Engine, and Deepgram Voice Agent/streaming surfaces. [S2][S9][S15][S16]
- Music-generation evidence is explicit in Google Lyria and Stability Stable Audio families. [S7][S8][S19][S20]
- Explicit SFX generation evidence in retrieved sources is strongest for ElevenLabs and Stability Stable Audio references. [S14][S19][S20]

## Assumptions Register
- No assumptions were used for factual claims.
- Any item without explicit official evidence in the retrieved source set is marked UNKNOWN.
