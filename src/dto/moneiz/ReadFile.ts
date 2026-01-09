import type { SponsorId } from '@/dto/moneiz/SponsorList.ts';

export type FileId = string;

export interface ReadFile {
  sponsorId: SponsorId;
  fileId: FileId;
}
