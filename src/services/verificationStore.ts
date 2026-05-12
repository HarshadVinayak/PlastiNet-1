export type VerificationSession = {
  id: string;
  beforeImage: string | null;
  beforeData: any | null;
  afterImage: string | null;
  timestamp: number;
};

class VerificationStore {
  private static instance: VerificationStore;
  private session: VerificationSession | null = null;

  private constructor() {}

  static getInstance(): VerificationStore {
    if (!VerificationStore.instance) {
      VerificationStore.instance = new VerificationStore();
    }
    return VerificationStore.instance;
  }

  startSession(image: string, data: any) {
    this.session = {
      id: Math.random().toString(36).substring(7),
      beforeImage: image,
      beforeData: data,
      afterImage: null,
      timestamp: Date.now()
    };
  }

  getSession() {
    return this.session;
  }

  clearSession() {
    this.session = null;
  }

  isSessionValid(): boolean {
    if (!this.session) return false;
    // Enforce time validity rule (min 30 seconds gap, max 1 hour)
    const elapsed = Date.now() - this.session.timestamp;
    return elapsed > 30000 && elapsed < 3600000;
  }
}

export const verificationStore = VerificationStore.getInstance();
