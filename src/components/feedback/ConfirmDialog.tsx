import { AlertTriangle, CheckCircle, Info, Loader2, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type ConfirmDialogVariant = 'default' | 'destructive' | 'warning' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { isRTL } = useLanguage();
  const haptics = useHaptics();

  const variantConfig = {
    default: {
      icon: Info,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      buttonVariant: 'default' as const,
    },
    destructive: {
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10',
      buttonVariant: 'default' as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      buttonVariant: 'default' as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    haptics.trigger(variant === 'destructive' ? 'warning' : 'success');
    await onConfirm();
  };

  const handleCancel = () => {
    haptics.selection();
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="gap-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={cn(
              'p-4 rounded-full',
              config.iconBg
            )}>
              <Icon className={cn('h-8 w-8', config.iconColor)} />
            </div>
          </div>

          <AlertDialogTitle className={cn(
            'text-center text-xl',
            isRTL && 'font-arabic'
          )}>
            {title}
          </AlertDialogTitle>
          
          <AlertDialogDescription className={cn(
            'text-center',
            isRTL && 'font-arabic'
          )}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {cancelLabel || (isRTL ? 'إلغاء' : 'Cancel')}
            </Button>
          </AlertDialogCancel>
          
          <AlertDialogAction asChild>
            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                'w-full sm:w-auto',
                variant === 'destructive' && 'bg-red-500 hover:bg-red-600'
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {confirmLabel || (isRTL ? 'تأكيد' : 'Confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
