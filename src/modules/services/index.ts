/**
 * Services Module
 * Service management and provider services utilities
 */

export { useServices } from '@/hooks/useServices';
export { useProviderServices } from '@/hooks/useProviderServices';
export { useServiceById } from '@/hooks/useServiceById';
export * as ServicesAPI from '@/api/services/services.service';
export { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '@/config/constants';
export { ServiceCard, ServiceDetailDialog } from '@/components/services';
export { ServiceForm } from '@/components/provider/ServiceForm';
export { SERVICE_TEMPLATES, getTemplateById, getTemplatesByType } from '@/config/service-templates';
export * from '@/api/schemas/service.schema';
