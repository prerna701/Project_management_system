import { SetMetadata } from '@nestjs/common';

export interface AuditMetadata {
  module: string;
  entityName: string;
  descriptionTemplate: string;
  idPath?: string;
  entityNamePath?: string;
  trackChanges?: boolean;
  impact?: 'low' | 'medium' | 'high';
}

export const SkipAuditLog = () => SetMetadata('skipAuditLog', true);

export const AuditLog = (metadata: AuditMetadata) =>
  SetMetadata('auditMetadata', {
    impact: 'low',
    trackChanges: false,
    ...metadata,
  });
