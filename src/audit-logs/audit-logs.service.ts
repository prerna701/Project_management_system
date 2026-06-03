import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './infrastructure/persistence/relational/repositories/audit-log.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async createAuditLog(data: any): Promise<void> {
    await this.auditLogRepository.create({
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      method: data.method,
      url: data.url,
      body: data.body,
      params: data.params,
      statusCode: data.statusCode,
      duration: data.duration,
      description: data.description,
      module: data.auditMetadata?.module,
      entityName: data.auditMetadata?.entityName,
      impact: data.auditMetadata?.impact,
      oldValues: data.oldValues,
      newValues: data.newValues,
      changedFields: data.changedFields,
      responseData: data.responseData,
      errorMessage: data.errorMessage,
      isError: data.isError || false,
    });
  }

  async findAll(page = 1, limit = 20) {
    return this.auditLogRepository.findAll(page, limit);
  }
}
