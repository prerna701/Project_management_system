import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogsService } from './audit-logs.service';
import { AuditMetadata } from './audit-log.decorator';
import * as os from 'os';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipAuditLog = this.reflector.get<boolean>('skipAuditLog', context.getHandler());
    if (skipAuditLog) return next.handle();

    const auditMetadata = this.reflector.getAllAndOverride<AuditMetadata>('auditMetadata', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!auditMetadata) return next.handle();

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, params } = request;
    const requestUser = request.user || null;
    const systemIp = this.getSystemIP();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const duration = Date.now() - startTime;
          const auditContext = responseData?._auditContext || {};
          const { changedFields = [], oldValues = {}, newValues = {}, impact: dynamicImpact } = auditContext;
          const finalImpact = dynamicImpact || auditMetadata.impact || 'low';

          let description = this.generateDescription(auditMetadata.descriptionTemplate, responseData, request, auditContext);
          if (!description?.trim()) {
            description = `${method} operation on ${auditMetadata.entityName}`;
          }

          const resolvedEntityName = this.resolveEntityName(auditMetadata, responseData, request);
          let resolvedUser = requestUser || auditContext?.user || responseData?.user || null;
          if (!resolvedUser && request.body?.email) {
            resolvedUser = { id: null, email: request.body.email };
          }

          const requestBody = { ...(body || {}) };
          if (!requestBody.email && resolvedUser?.email) requestBody.email = resolvedUser.email;
          if (requestBody.password) delete requestBody.password;

          if (responseData?._auditContext) delete responseData._auditContext;

          await this.auditLogsService.createAuditLog({
            userId: resolvedUser?.id || null,
            userEmail: resolvedUser?.email || null,
            ipAddress: systemIp,
            method,
            url,
            body: requestBody,
            params,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            auditMetadata: { ...auditMetadata, entityName: resolvedEntityName, impact: finalImpact },
            description,
            responseData,
            oldValues: Object.keys(oldValues).length > 0 ? oldValues : null,
            newValues: Object.keys(newValues).length > 0 ? newValues : null,
            changedFields: changedFields.length > 0 ? changedFields : null,
          });
        } catch (error) {
          this.logger.error('Error in audit logging:', error);
        }
      }),

      catchError((error) => {
        void (async () => {
          try {
            const duration = Date.now() - startTime;
            const errorAuditContext = error._auditContext || {};
            const errorImpact = errorAuditContext.impact || 'high';
            const errorDescription = `Failed ${method} operation on ${auditMetadata.entityName}`;

            let resolvedUser = requestUser;
            if (!resolvedUser && request.body?.email) {
              resolvedUser = { id: null, email: request.body.email };
            }
            const requestBody = { ...(body || {}) };
            if (requestBody.password) delete requestBody.password;

            await this.auditLogsService.createAuditLog({
              userId: resolvedUser?.id || null,
              userEmail: resolvedUser?.email || null,
              ipAddress: systemIp,
              method,
              url,
              body: requestBody,
              params,
              statusCode: error.status || 500,
              errorMessage: error.message || 'Internal Server Error',
              duration: `${duration}ms`,
              auditMetadata: { ...auditMetadata, impact: errorImpact },
              description: errorDescription,
              isError: true,
            });
          } catch (auditError) {
            this.logger.error('Error in error audit logging:', auditError);
          }
        })();
        return throwError(() => error);
      }),
    );
  }

  private generateDescription(template: string, responseData: any, request: any, auditContext: any = {}): string {
    let description = template;
    const placeholders = {
      '{method}': request.method,
      '{entityName}': responseData?.data?.name || responseData?.name || responseData?.title || 'item',
      '{entityId}': responseData?.data?.id || responseData?.id || request.params?.id || 'unknown',
      '{userId}': request.user?.id || 'anonymous',
      '{userEmail}': request.user?.email || 'unknown',
    };
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      description = description.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return description;
  }

  private resolveEntityName(auditMetadata: AuditMetadata, responseData: any, request: any): string {
    const rawEntityName = auditMetadata.entityName;
    if (rawEntityName.startsWith('{') && rawEntityName.endsWith('}')) {
      if (auditMetadata.entityNamePath && responseData) {
        const extracted = auditMetadata.entityNamePath
          .split('.')
          .reduce((obj, key) => obj?.[key], responseData);
        if (extracted) return String(extracted);
      }
      return String(
        responseData?.data?.name || responseData?.name || responseData?.data?.email ||
        request.body?.name || rawEntityName.replace(/[{}]/g, ''),
      );
    }
    return rawEntityName;
  }

  private getSystemIP(): string {
    try {
      const networkInterfaces = os.networkInterfaces();
      for (const addresses of Object.values(networkInterfaces)) {
        if (addresses) {
          for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) return address.address;
          }
        }
      }
      return '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  }
}
