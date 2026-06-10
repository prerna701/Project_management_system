import { calculateCompositeEvidenceScore } from './composite-evidence-score';
import { EvidenceConfidence } from './enums/evidence-confidence.enum';

describe('calculateCompositeEvidenceScore', () => {
  it.each([
    [80, EvidenceConfidence.HIGH, 'APPROVE_READY'],
    [50, EvidenceConfidence.MEDIUM, 'NEEDS_REVIEW'],
    [49, EvidenceConfidence.LOW_RED_FLAG, 'RED_FLAG'],
  ])(
    'classifies a weighted score of %s',
    (score, confidence, recommendation) => {
      expect(
        calculateCompositeEvidenceScore([{ score, weight: 100 }]),
      ).toEqual({ overallScore: score, confidence, recommendation });
    },
  );

  it('combines providers according to their configured weights', () => {
    const result = calculateCompositeEvidenceScore([
      { score: 100, weight: 35 },
      { score: 50, weight: 30 },
      { score: 70, weight: 20 },
      { score: 100, weight: 5 },
      { score: 40, weight: 10 },
    ]);

    expect(result.overallScore).toBe(73);
    expect(result.confidence).toBe(EvidenceConfidence.MEDIUM);
  });
});
