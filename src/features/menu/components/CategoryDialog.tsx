import { X, CookingPot, Plus, Save } from "@tamagui/lucide-icons";
import { Button, Dialog, XStack, YStack, Text, View, Input } from "tamagui";
import { useState } from "react";
import { Category, dishesApi } from "../../../api/dishesApi";
import { useForm } from "@tanstack/react-form";

export function CategoryDialog({
  category,
  filter,
  setFilter,
}: {
  category: Category | null;
  filter: number | null;
  setFilter: ((filter: number) => void) | null;
}) {
  const [createCategory] = dishesApi.useCreateCategoryMutation();
  const [updateCategory] = dishesApi.useUpdateCategoryMutation();
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      name: category ? category.name : "",
    },
    onSubmit: async ({ value }) => {
      if (!category && !value.name) return;
      console.log("Sending to FastAPI:", value);
      if (category)
        await updateCategory({
          id: category.id,
          body: value,
        });
      else await createCategory(value);
      setOpen(false);
    },
  });

  return (
    <>
      {category ? (
        <div
          style={{ display: "contents" }}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Button
            key={category.id}
            onLongPress={() => setOpen(true)}
            onPress={() => setFilter!(category.id)}
            p="$4"
            bw={2}
            boc={filter === category.id ? "saddleBrown" : "$cardBorder"}
            bg={filter === category.id ? "saddleBrown" : "$cardBg"}
            br="$5"
            ai={"center"}
            jc={"space-between"}
          >
            <Text fow={500} col={filter === category.id ? "white" : undefined}>
              {category.name}
            </Text>
          </Button>
        </div>
      ) : (
        <Button
          onPress={() => setOpen(true)}
          br="$5"
          ai={"center"}
          jc={"space-between"}
          backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
          color={"white"}
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
                form.handleSubmit();
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
                    <CookingPot col={"$white"} />
                  </View>
                  <YStack>
                    <Text col={"$white"} fos={"$7"} fow={500} mb={"$2"}>
                      {category ? "Renombrar categoría" : "Crear categoría"}
                    </Text>
                    <Text col={"$amber100"} fos={"$4"}>
                      {category
                        ? `Actualiza el nombre de ${category.name}`
                        : "¿Cómo se llamará la nueva categoría?"}
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
                <YStack gap={"$2"}>
                  <XStack gap={"$2"} ai={"center"}>
                    <CookingPot size={15} color={"$orange500"} />
                    <Text>Nombre</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="name"
                    children={(field) => (
                      <Input
                        fos={"$5"}
                        f={1}
                        bw={2}
                        bc="$cardBorder"
                        bg="$cardBg"
                        outlineStyle="none"
                        outlineColor="transparent"
                        focusStyle={{
                          boc: "$brandMain",
                        }}
                        placeholder="Postres"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  />
                </YStack>
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
                    <Save col="white"></Save>
                    <Text col="white" fontWeight="600" fontFamily="$body">
                      Guardar categoría
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
