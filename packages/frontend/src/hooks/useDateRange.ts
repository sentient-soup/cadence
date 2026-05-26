import { useState } from 'react';

export type DateRange = 7 | 30 | 90 | 365;

export function useDateRange(initial: DateRange = 30) {
  const [range, setRange] = useState<DateRange>(initial);
  return { range, setRange };
}
