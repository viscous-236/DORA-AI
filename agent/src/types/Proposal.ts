export interface ProposalAnalysis {
  summary: string;
  benefits: string[];
  risks: string[];
  similarProposals: string[];
  recommendation: "YES" | "NO" | "ABSTAIN";
  confidence: number;
  reasoning: string;
}

export interface Proposal {
  id: string;
  title: string;
  body: string;
  author: string;
  created: number;
  start: number;
  end: number;
  state: string;
  choices: string[];
  scores: number[];
  scores_total: number;
}
