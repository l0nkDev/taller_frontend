import { X, CookingPot, Plus, Save, LayoutGrid } from '@tamagui/lucide-icons';
import { Button, Dialog, XStack, YStack, Text, View, Input } from 'tamagui';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { floorApi, FloorRead } from '../../../api/floorApi';

export function FloorDialog({
  floor,
  selectedId,
  setSelectedId,
}: {
  floor: FloorRead | null;
  selectedId: number | null;
  setSelectedId: ((id: number) => void) | null;
}) {
  const [createFloor] = floorApi.useCreateFloorMutation();
  const [updateFloor] = floorApi.useUpdateFloorMutation();
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      name: floor ? floor.name : '',
    },
    onSubmit: async ({ value }) => {
      if (!floor && !value.name) return;
      console.log('Sending to FastAPI:', value);
      if (floor)
        await updateFloor({
          id: floor.id,
          name: value.name,
        });
      else await createFloor(value.name);
      setOpen(false);
    },
  });

  return (
    <>
      {floor ? (
        <div
          style={{ display: 'contents' }}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Button
            key={floor.id}
            onPress={() => setSelectedId && setSelectedId(floor.id)}
            p="$4"
            bw={2}
            boc={selectedId === floor.id ? 'saddleBrown' : '$cardBorder'}
            bg={selectedId === floor.id ? 'saddleBrown' : '$cardBg'}
            br="$5"
            ai="center"
            jc="space-between"
          >
            <Text fow={500} col={selectedId === floor.id ? 'white' : undefined}>
              {floor.name}
            </Text>
          </Button>
        </div>
      ) : (
        <Button
          onPress={() => setOpen(true)}
          br="$5"
          ai="center"
          jc="space-between"
          backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
          color="white"
          icon={<Plus />}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            bg="$gray800"
            opacity={0.5}
            transition="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bw={2}
            boc="$cardBorder"
            p={0}
            onPointerDownOutside={(event: any) => {
              event.preventDefault();
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <XStack
                backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                p="$5"
                ai="center"
                jc="space-between"
                btrr="$3"
                btlr="$3"
              >
                <XStack gap="$3">
                  <View w="$4" h="$4" br="$5" bc="#FFFFFF33" ai="center" jc="center">
                    <LayoutGrid col="$white" />
                  </View>
                  <YStack>
                    <Text col="$white" fos="$7" fow={500} mb="$2">
                      {floor ? 'Renombrar piso' : 'Crear piso'}
                    </Text>
                    <Text col="$amber100" fos="$4">
                      {floor
                        ? `Actualiza el nombre de ${floor.name}`
                        : '¿Cómo se llamará el nuevo piso?'}
                    </Text>
                  </YStack>
                </XStack>
                <Dialog.Close asChild>
                  <Button
                    size="$3"
                    circular
                    chromeless
                    icon={<X color="$white" size={24} />}
                    hoverStyle={{ bg: 'rgba(255,255,255,0.1)' }}
                  />
                </Dialog.Close>
              </XStack>
              <YStack gap="$3" p="$5">
                <YStack gap="$2">
                  <XStack gap="$2" ai="center">
                    <CookingPot size={15} color="$orange500" />
                    <Text>Nombre</Text>
                    <Text col="$amber700">*</Text>
                  </XStack>
                  <form.Field name="name">
                    {(field) => (
                      <Input
                        fos="$5"
                        f={1}
                        bw={2}
                        bc="$cardBorder"
                        bg="$cardBg"
                        outlineStyle="none"
                        outlineColor="transparent"
                        focusStyle={{
                          boc: '$brandMain',
                        }}
                        placeholder="Salón"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  </form.Field>
                </YStack>
                <XStack gap="$3">
                  <Dialog.Close asChild>
                    <Button
                      f={1}
                      bw={2}
                      boc="$cardBorder"
                      hoverStyle={{ scale: 1.02 }}
                      disabledStyle={{ opacity: 0.5 }}
                    >
                      <Text fontWeight="600" fontFamily="$body">
                        Cancelar
                      </Text>
                    </Button>
                  </Dialog.Close>
                  <Button
                    f={1}
                    backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                    hoverStyle={{ scale: 1.02 }}
                    disabledStyle={{ opacity: 0.5 }}
                  >
                    <Save col="white" />
                    <Text col="white" fontWeight="600" fontFamily="$body">
                      Guardar piso
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </form>
            <Dialog.Close />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
