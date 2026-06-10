import { Injectable } from '@nestjs/common';
import { EvidenceConfidence } from './enums/evidence-confidence.enum';

export interface CommitEvidenceInput {
  sha: string;
  committedAt: Date;
  message: string;
  url: string | null;
  filesChanged: number;
  additions: number;
  deletions: number;
}

@Injectable()
export class WorkTimeCalculatorService {
  calculate(loggedMinutes: number, commits: CommitEvidenceInput[]) {
    const sorted = [...commits].sort(
      (a, b) => a.committedAt.getTime() - b.committedAt.getTime(),
    );
    const first = sorted[0]?.committedAt ?? null;
    const last = sorted.at(-1)?.committedAt ?? null;
    let estimatedMinutes = sorted.length === 1 ? 30 : 0;
    let largestGapMinutes = 0;

    for (let index = 1; index < sorted.length; index += 1) {
      const gap = Math.max(
        0,
        Math.round(
          (sorted[index].committedAt.getTime() -
            sorted[index - 1].committedAt.getTime()) /
            60000,
        ),
      );
      largestGapMinutes = Math.max(largestGapMinutes, gap);
      estimatedMinutes += gap <= 90 ? gap : 30;
    }

    const ratio = loggedMinutes > 0 ? estimatedMinutes / loggedMinutes : 0;
    const confidence =
      ratio >= 0.8
        ? EvidenceConfidence.HIGH
        : ratio >= 0.5
          ? EvidenceConfidence.MEDIUM
          : EvidenceConfidence.LOW_RED_FLAG;
    const warnings: string[] = [];
    if (!sorted.length) warnings.push('No matching Git commits were found.');
    if (sorted.length === 1)
      warnings.push('Only one commit was found; Git evidence is limited.');
    if (largestGapMinutes > 90)
      warnings.push(
        `The largest gap between commits was ${largestGapMinutes} minutes.`,
      );
    if (estimatedMinutes < loggedMinutes * 0.5)
      warnings.push('Git activity supports less than half of the logged time.');

    return {
      confidence,
      gitWindowMinutes:
        first && last
          ? Math.max(
              0,
              Math.round((last.getTime() - first.getTime()) / 60000),
            )
          : 0,
      gitEstimatedMinutes: estimatedMinutes,
      commitCount: sorted.length,
      firstCommitAt: first,
      lastCommitAt: last,
      largestGapMinutes,
      filesChanged: sorted.reduce(
        (sum, commit) => sum + commit.filesChanged,
        0,
      ),
      additions: sorted.reduce((sum, commit) => sum + commit.additions, 0),
      deletions: sorted.reduce((sum, commit) => sum + commit.deletions, 0),
      warnings,
      commits: sorted.map((commit) => ({
        sha: commit.sha,
        message: commit.message,
        committedAt: commit.committedAt.toISOString(),
        url: commit.url,
      })),
    };
  }
}
