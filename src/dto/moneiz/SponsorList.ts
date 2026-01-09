import type { FileId } from '@/dto/moneiz/ReadFile.ts';

export type SponsorId = string;

export type SponsorList = {
  id: SponsorId;
  name: string;
  url?: string;
  logo?: FileId;
};
