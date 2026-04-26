import { Toast, useToastState } from '@tamagui/toast';
import { YStack, XStack } from 'tamagui';
import { AlertCircle, CheckCircle } from '@tamagui/lucide-icons';

export function CurrentToast() {
  const currentToast = useToastState();
  if (!currentToast || currentToast.isHandledNatively) return null;
  const isError = currentToast.customData?.type === 'error';
  const bgColor = isError ? '#ef4444' : '#10b981';
  const Icon = isError ? AlertCircle : CheckCircle;

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.9, y: -20 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      bg={bgColor}
      br="$4"
      p="$4"
      elevation="$4"
      viewportName={currentToast.viewportName}
    >
      <XStack gap="$3" ai="center">
        <Icon color="white" size={24} />
        <YStack f={1}>
          <Toast.Title color="white" fontWeight="bold" fontSize="$5">
            {currentToast.title}
          </Toast.Title>
          {!!currentToast.message && (
            <Toast.Description color="white" fontSize="$3" mt="$1">
              {currentToast.message}
            </Toast.Description>
          )}
        </YStack>
      </XStack>
    </Toast>
  );
}