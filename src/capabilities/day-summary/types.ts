export interface DaySummaryData {
  date: string;
  all_step: number;
  sport_list: Array<{
    time: string;
    step: number;
    cal: number;
    dis: number;
  }>;
  rate_list: Array<{
    time: string;
    rate: number;
  }>;
  bp_list: Array<{
    time: string;
    high: number;
    low: number;
  }>;
}
