export type EventSummary = {
  id: string;
  name: string;
};

export type EventId = string;

export type Event = {
  id: EventId;
  name: string;
  startDate: string; // LocalDate, ISO format
  endDate: string; // LocalDate, ISO format
  website?: string;
  venue?: string;
};
