import {
  SYSTEM_PROMPT as SWIGGY_SYSTEM_PROMPT,
  INITIAL_MESSAGE as SWIGGY_INITIAL_MESSAGE,
} from "./system-prompt";
import {
  UBER_SYSTEM_PROMPT,
  UBER_INITIAL_MESSAGE,
} from "./uber-prompt";

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  brandLetter: string;
  systemPrompt: string;
  initialMessage: string;
  evalScenario: string;
  maxMoves: number;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "swiggy",
    title: "Swiggy PM Case Study",
    subtitle: "Investigate the 12% order drop",
    brandLetter: "S",
    systemPrompt: SWIGGY_SYSTEM_PROMPT,
    initialMessage: SWIGGY_INITIAL_MESSAGE,
    evalScenario:
      "Swiggy orders dropped 12% in 2 weeks. The candidate is asking a junior data analyst questions to investigate the root cause.",
    maxMoves: 15,
  },
  {
    id: "uber",
    title: "Uber PM Case Study",
    subtitle: "Investigate the 12% completed rides drop",
    brandLetter: "U",
    systemPrompt: UBER_SYSTEM_PROMPT,
    initialMessage: UBER_INITIAL_MESSAGE,
    evalScenario:
      "Uber completed rides dropped 12% in 2 weeks. The candidate is asking a junior data analyst questions to investigate the root cause.",
    maxMoves: 20,
  },
];
