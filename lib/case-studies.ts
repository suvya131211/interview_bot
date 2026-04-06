import {
  SYSTEM_PROMPT as SWIGGY_SYSTEM_PROMPT,
  INITIAL_MESSAGE as SWIGGY_INITIAL_MESSAGE,
} from "./system-prompt";
import {
  UBER_SYSTEM_PROMPT,
  UBER_INITIAL_MESSAGE,
} from "./uber-prompt";
import {
  YOUTUBE_SYSTEM_PROMPT,
  YOUTUBE_INITIAL_MESSAGE,
} from "./youtube-prompt";
import {
  TRAVEL_SYSTEM_PROMPT,
  TRAVEL_INITIAL_MESSAGE,
} from "./travel-prompt";
import {
  ZEPTO_SYSTEM_PROMPT,
  ZEPTO_INITIAL_MESSAGE,
} from "./zepto-prompt";

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
  {
    id: "youtube",
    title: "YouTube PM Case Study",
    subtitle: "Investigate the 30% first-session watch time drop",
    brandLetter: "Y",
    systemPrompt: YOUTUBE_SYSTEM_PROMPT,
    initialMessage: YOUTUBE_INITIAL_MESSAGE,
    evalScenario:
      "YouTube first-session watch time dropped 30% over 4 weeks in a growth market. The candidate is acting as Product Lead and questioning a data analyst to investigate the root cause.",
    maxMoves: 20,
  },
  {
    id: "travel",
    title: "Travel Booking PM Case Study",
    subtitle: "Improve flight booking completion after shortlist",
    brandLetter: "T",
    systemPrompt: TRAVEL_SYSTEM_PROMPT,
    initialMessage: TRAVEL_INITIAL_MESSAGE,
    evalScenario:
      "A travel booking company has lower-than-expected booking completion after users shortlist flights. The candidate is a PM tasked with diagnosing the friction and designing an improvement. This is a product sense / feature design case, not a metric debugging case.",
    maxMoves: 15,
  },
  {
    id: "zepto",
    title: "Quick Commerce PM Case Study",
    subtitle: "Prioritize one initiative for retention & profitability",
    brandLetter: "Z",
    systemPrompt: ZEPTO_SYSTEM_PROMPT,
    initialMessage: ZEPTO_INITIAL_MESSAGE,
    evalScenario:
      "A quick commerce app wants to shift from acquisition to retention and profitability. The candidate must evaluate 4 initiatives and prioritize ONE, justifying trade-offs. This is a prioritization and decision-making case, not a diagnosis or feature design case.",
    maxMoves: 20,
  },
];
