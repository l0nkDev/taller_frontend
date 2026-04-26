import { User, X, Trash2 } from "@tamagui/lucide-icons";
import { Button, Dialog, XStack, YStack, Text, View } from "tamagui";
import { useState } from "react";
import { usersApi } from "../../../api/usersApi";

export function DeleteUserDialog({ userId }: { userId: number }) {
  const [deleteUser] = usersApi.useDeleteUserMutation();
  const [open, setOpen] = useState(false);

  async function onSubmit(): Promise<void>  {
    await deleteUser(userId);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button
          size="$3"
          circular
          chromeless
          hoverStyle={{ bg: "#fee2e2" }}
          icon={<Trash2 size={18} color="#ef4444" />}
        />
      </Dialog.Trigger>
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
          boc={"$cardBorder"}
          p={0}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSubmit();
            }}
          >
            <XStack
              backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
              p={"$5"}
              ai={"center"}
              jc={"space-between"}
              btrr={"$3"}
              btlr={"$3"}
            >
              <XStack gap={"$3"}>
                <View
                  w={"$4"}
                  h={"$4"}
                  br={"$5"}
                  bc={"#FFFFFF33"}
                  ai={"center"}
                  jc={"center"}
                >
                  <User col={"$white"} />
                </View>
                <YStack>
                  <Text col={"$white"} fos={"$7"} fow={500} mb={"$2"}>
                    Eliminar usuario
                  </Text>
                  <Text col={"$amber100"} fos={"$4"}>
                    ¿Seguro que quieres eliminar a este usuario?
                  </Text>
                </YStack>
              </XStack>
              <Dialog.Close asChild>
                <Button
                  size="$3"
                  circular
                  chromeless
                  icon={<X color="$white" size={24} />}
                  hoverStyle={{ bg: "rgba(255,255,255,0.1)" }}
                />
              </Dialog.Close>
            </XStack>
            <YStack gap={"$3"} p={"$5"}>
              <XStack gap={"$3"}>
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
                  <Trash2 col="white"></Trash2>
                  <Text col="white" fontWeight="600" fontFamily="$body">
                    Eliminar Usuario
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </form>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
