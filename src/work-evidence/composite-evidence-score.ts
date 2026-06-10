import { EvidenceConfidence } from './enums/evidence-confidence.enum';

export interface WeightedEvidenceScore {
  score: number;
  weight: number;
}

export function calculateCompositeEvidenceScore(
  providers: WeightedEvidenceScore[],
) {
  const totalWeight = providers.reduce(
    (sum, provider) => sum + provider.weight,
    0,
  );
  const overallScore = totalWeight
    ? Math.round(
        providers.reduce(
          (sum, provider) => sum + provider.score * provider.weight,
          0,
        ) / totalWeight,
      )
    : 0;
  const confidence =
    overallScore >= 80
      ? EvidenceConfidence.HIGH
      : overallScore >= 50
        ? EvidenceConfidence.MEDIUM
        : EvidenceConfidence.LOW_RED_FLAG;

  return {
    overallScore,
    confidence,
    recommendation:
      confidence === EvidenceConfidence.HIGH
        ? 'APPROVE_READY'
        : confidence === EvidenceConfidence.MEDIUM
          ? 'NEEDS_REVIEW'
          : 'RED_FLAG',
  };
}
