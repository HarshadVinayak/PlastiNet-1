export interface ApiUsageLog {
  service: string;
  endpoint: string;
  status: number;
  latency: number;
  timestamp: string;
}

export const usageService = {
  logRequest(service: string, endpoint: string, status: number, latency: number) {
    const log: ApiUsageLog = {
      service,
      endpoint,
      status,
      latency,
      timestamp: new Date().toISOString()
    };

    console.log(`[Telemetry] ${service} -> ${endpoint} (${status}) in ${latency}ms`);
    
    // In production, we would send this to Supabase or Telemetry API
    const logs = JSON.parse(localStorage.getItem('api_telemetry') || '[]');
    logs.push(log);
    // Keep last 100 logs
    localStorage.setItem('api_telemetry', JSON.stringify(logs.slice(-100)));
  },

  getStats() {
    const logs: ApiUsageLog[] = JSON.parse(localStorage.getItem('api_telemetry') || '[]');
    const stats = logs.reduce((acc: any, log) => {
      acc[log.service] = (acc[log.service] || 0) + 1;
      return acc;
    }, {});
    return stats;
  }
};
