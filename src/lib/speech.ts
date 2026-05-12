
// Web Speech API wrapper for Chloe AI
export class SpeechService {
  private static synthesis = window.speechSynthesis;
  private static recognition: any = null;

  static initSTT(onResult: (text: string) => void, onEnd: () => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return null;
    }

    if (!this.recognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }

    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    this.recognition.onend = onEnd;
    this.recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      onEnd();
    };

    return this.recognition;
  }

  /**
   * Speaks the given text.
   * @param text       The text to read aloud.
   * @param voiceName  Optional preferred voice name.
   * @param onEnd      Optional callback fired when speech finishes or is cancelled.
   */
  static speak(text: string, voiceName?: string, onEnd?: () => void) {
    // Cancel any ongoing speech first
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const applyVoice = () => {
      const voices = this.synthesis.getVoices();
      const chloeVoice =
        voices.find((v) => v.name.includes(voiceName || 'Female')) ||
        voices.find((v) => v.name.includes('Google US English'));
      if (chloeVoice) utterance.voice = chloeVoice;
    };

    // Voices may not be loaded yet — wait if needed
    if (this.synthesis.getVoices().length > 0) {
      applyVoice();
    } else {
      this.synthesis.onvoiceschanged = () => {
        applyVoice();
        this.synthesis.onvoiceschanged = null;
      };
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    this.synthesis.speak(utterance);
  }

  static stop() {
    this.synthesis.cancel();
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
