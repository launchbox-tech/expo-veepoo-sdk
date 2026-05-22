/** SOS call-attempt count from the Band. Vendor enforces `times` stays within `[min_times, max_times]`. */
export interface SosCallTimesSettings {
  times: number;
  min_times: number;
  max_times: number;
}
