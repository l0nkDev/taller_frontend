import {
  Plus,
  Save,
  Pencil,
  X,
  Briefcase,
  ChevronDown,
  CookingPot,
  TextCursor,
  Banknote,
  Check,
} from "@tamagui/lucide-icons";
import { useForm } from "@tanstack/react-form";
import {
  Button,
  Dialog,
  XStack,
  YStack,
  Text,
  View,
  Select,
  Separator,
  Switch,
} from "tamagui";
import { Input } from "../../../components/Input";
import { useState } from "react";
import { Dish, dishesApi } from "../../../api/dishesApi";

export function MenuDialog({ editing = null }: { editing: Dish | null }) {
  const [createUser] = dishesApi.useCreateDishMutation();
  const [updateUser] = dishesApi.useUpdateDishMutation();
  const [open, setOpen] = useState(false);
  const { data } = dishesApi.useGetCategoriesQuery();
  const form = useForm({
    defaultValues: {
      name: editing ? editing.name : "",
      description: editing ? editing.description : "",
      price: editing ? String(editing.price) : "0.00",
      category_id: editing ? String(editing.category_id) : "0",
      available: editing ? editing.available : true
    },
    onSubmit: async ({ value }) => {
      if (
        !editing &&
        (!value.name ||
          !value.description ||
          !value.price ||
          Number(value.price) <= 0 ||
          !value.category_id ||
          value.category_id === "0")
      )
        return;
      console.log("Sending to FastAPI:", value);
      if (editing)
        await updateUser({
          id: editing.id,
          body: {
            ...value,
            price: Number(value.price),
            category_id: Number(value.category_id),
            available: form.state.values.available
          },
        });
      else
        await createUser({
          ...value,
          price: Number(value.price),
          category_id: Number(value.category_id),
          available: form.state.values.available
        });
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        {editing ? (
          <Button
            backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
            hoverStyle={{ scale: 1.02 }}
            disabledStyle={{ opacity: 0.5 }}
          >
            <Pencil col="white"></Pencil>
            <Text col="white" fontWeight="600" fontFamily="$body">
              Editar
            </Text>
          </Button>
        ) : (
          <Button
            backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
            hoverStyle={{ scale: 1.02 }}
            disabledStyle={{ opacity: 0.5 }}
          >
            <Plus col="white"></Plus>
            <Text col="white" fontWeight="600" fontFamily="$body">
              Agregar plato
            </Text>
          </Button>
        )}
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
          w={"60%"}
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
                    {editing ? "Editar Plato" : "Nuevo Plato"}
                  </Text>
                  <Text col={"$amber100"} fos={"$4"}>
                    {editing
                      ? "Actualiza la información del plato"
                      : "Completa los datos del nuevo plato"}
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
                      placeholder="Majadito"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                    />
                  )}
                />
              </YStack>
              <YStack gap={"$2"}>
                <XStack gap={"$2"} ai={"center"}>
                  <TextCursor size={15} color={"$orange500"} />
                  <Text>Descripción</Text>
                  <Text col={"$amber700"}>*</Text>
                </XStack>
                <form.Field
                  name="description"
                  children={(field) => (
                    <Input
                      fos={"$5"}
                      numberOfLines={4}
                      f={1}
                      bw={2}
                      bc="$cardBorder"
                      bg="$cardBg"
                      outlineStyle="none"
                      outlineColor="transparent"
                      focusStyle={{
                        boc: "$brandMain",
                      }}
                      placeholder="Detalles, ingredientes, etc..."
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                    />
                  )}
                />
              </YStack>
              <XStack gap={"$3"}>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"} ai={"center"}>
                    <Banknote size={15} color={"$orange500"} />
                    <Text>Precio</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="price"
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
                        placeholder="77378759"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  />
                </YStack>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"} ai={"center"}>
                    <Briefcase size={15} color={"$orange500"} />
                    <Text>Categoría</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="category_id"
                    children={(field) => (
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <Select.Trigger bw={2} w={180}>
                          <Select.Value
                            placeholder="Selecciona una categoría..."
                            fos={"$5"}
                          />
                          <ChevronDown pl={"$3"}></ChevronDown>
                        </Select.Trigger>
                        <Select.FocusScope loop trapped focusOnIdle={true}>
                          <Select.Content zIndex={200000}>
                            <Select.ScrollUpButton />
                            <Select.Viewport bw={2}>
                              <Select.Group>
                                {data && data.map((c) => <Select.Item
                                  index={c.id}
                                  value={String(c.id)}
                                  hoverStyle={{ backgroundColor: "$gray200" }}
                                >
                                  <Select.ItemText fos={"$5"}>
                                    {c.name}
                                  </Select.ItemText>
                                </Select.Item>)}
                              </Select.Group>
                            </Select.Viewport>
                            <Select.ScrollDownButton />
                          </Select.Content>
                        </Select.FocusScope>
                      </Select>
                    )}
                  />
                </YStack>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"} ai={"center"}>
                    <Check size={15} color={"$orange500"} />
                    <Text>Disponible</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="available"
                    children={(field) => (
                      <Switch
                      mt={"$2"}
                      bw={2} boc={field.state.value ? "$cardBorder" : "$gray200"}
                      alignSelf="center"
                      size={"$4"}
                        checked={!!field.state.value}
                        onCheckedChange={(val) => field.handleChange(val)}
                        bg={field.state.value ? "$brandMain" : "$gray600"}
                      >
                        <Switch.Thumb animation="bouncy" 
                      bw={2} boc={"$gray200"}/>
                      </Switch>
                    )}
                  />
                </YStack>
              </XStack>
              <Separator bw={1.5} />
              <XStack gap={"$3"}>
                <Dialog.Close asChild>
                  <Button
                    f={1}
                    bw={2}
                    boc="$cardBorder"
                    hoverStyle={{ scale: 1.02 }}
                    disabledStyle={{ opacity: 0.5 }}
                    onPress={form.handleSubmit}
                  >
                    <Text fontWeight="600" fontFamily="$body">
                      Cancelar
                    </Text>
                  </Button>
                </Dialog.Close>
                <form.Subscribe
                  selector={(state) => [
                    state.values.name,
                    state.values.description,
                    state.values.price,
                    state.values.category_id,
                  ]}
                >
                  {([name, description, price, category_id]) => {
                    return (
                      <Button
                        f={1}
                        disabled={
                          !editing &&
                          (!name ||
                            !description ||
                            !price ||
                            Number(price) <= 0 ||
                            !category_id ||
                            category_id === "0")
                        }
                        backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                        hoverStyle={{ scale: 1.02 }}
                        disabledStyle={{ opacity: 0.5 }}
                      >
                        <Save col="white"></Save>
                        <Text col="white" fontWeight="600" fontFamily="$body">
                          {editing ? "Guardar cambios" : "Guardar Plato"}
                        </Text>
                      </Button>
                    );
                  }}
                </form.Subscribe>
              </XStack>
            </YStack>
          </form>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
