
export enum AppStep {
  WELCOME = 'WELCOME',
  PROFILE = 'PROFILE',
  DISCOVERY = 'DISCOVERY',
  ANALYSIS = 'ANALYSIS',
  DASHBOARD = 'DASHBOARD',
  DOCUMENT_VERIFY = 'DOCUMENT_VERIFY'
}

export interface CitizenProfile {
  age: number;
  gender: string;
  state: string;
  district: string;
  education: string;
  incomeRange: string;
  occupation: string;
  category?: string;
  disability?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  provider: string;
  eligibility: 'YES' | 'NO' | 'PROBABLE';
  benefit: string;
  deadline: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  description: string;
  requiredDocuments: {
    name: string;
    status: 'AVAILABLE' | 'MISSING' | 'PENDING_VERIFICATION';
  }[];
  actionPlan: {
    day: number;
    task: string;
    status: 'PENDING' | 'DONE' | 'FAILED';
    details: string;
  }[];
  risks: {
    ambiguity: string;
    documentRisk: string;
  };
  nextCheck: {
    trigger: string;
    date: string;
  };
}

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'thinking' | 'action' | 'error';
  message: string;
}

export interface DocumentScanResult {
  name?: string;
  dob?: string;
  idNumber?: string;
  type?: string;
}
