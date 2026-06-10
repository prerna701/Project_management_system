import { EvidenceConfidence } from './enums/evidence-confidence.enum';
import {
  CommitEvidenceInput,
  WorkTimeCalculatorService,
} from './work-time-calculator.service';

const commit = (time: string): CommitEvidenceInput => ({
  sha: time,
  committedAt: new Date(`2026-06-10T${time}:00.000Z`),
  message: `Commit at ${time}`,
  url: null,
  filesChanged: 1,
  additions: 10,
  deletions: 2,
});

describe('WorkTimeCalculatorService', () => {
  const service = new WorkTimeCalculatorService();

  it('caps gaps over 90 minutes at a 30 minute evidence buffer', () => {
    const result = service.calculate(300, [
      commit('10:00'),
      commit('10:45'),
      commit('11:30'),
      commit('15:00'),
    ]);

    expect(result.gitWindowMinutes).toBe(300);
    expect(result.gitEstimatedMinutes).toBe(120);
    expect(result.largestGapMinutes).toBe(210);
    expect(result.confidence).toBe(EvidenceConfidence.LOW_RED_FLAG);
  });

  it.each([
    [100, 80, EvidenceConfidence.HIGH],
    [100, 50, EvidenceConfidence.MEDIUM],
    [100, 49, EvidenceConfidence.LOW_RED_FLAG],
  ])(
    'classifies %s logged minutes and %s supported minutes',
    (loggedMinutes, supportedMinutes, confidence) => {
      const result = service.calculate(loggedMinutes, [
        commit('10:00'),
        {
          ...commit('10:01'),
          committedAt: new Date(
            new Date('2026-06-10T10:00:00.000Z').getTime() +
              supportedMinutes * 60000,
          ),
        },
      ]);

      expect(result.confidence).toBe(confidence);
    },
  );

  it('treats a single commit as limited 30 minute evidence', () => {
    const result = service.calculate(120, [commit('10:00')]);

    expect(result.gitEstimatedMinutes).toBe(30);
    expect(result.confidence).toBe(EvidenceConfidence.LOW_RED_FLAG);
    expect(result.warnings).toContain(
      'Only one commit was found; Git evidence is limited.',
    );
  });
});
