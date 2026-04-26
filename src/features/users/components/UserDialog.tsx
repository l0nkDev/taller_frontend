import {
  Plus,
  User as UserIcon,
  Save,
  Pencil,
  X,
  AtSign,
  Phone,
  Lock,
  Briefcase,
  ChevronDown,
  Eye,
  EyeOff,
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
  Circle,
  Separator,
} from "tamagui";
import { Input } from "../../../components/Input";
import { useState } from "react";
import { User, usersApi } from "../../../api/usersApi";

export function UserDialog({ editing = null }: { editing: User | null }) {
  const [createUser] = usersApi.useCreateUserMutation();
  const [updateUser] = usersApi.useUpdateUserMutation();
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      username: editing ? editing.username : "",
      password: "",
      passwordConfirm: "",
      fname: editing ? editing.fname : "",
      lname: editing ? editing.lname : "",
      phone: editing ? editing.phone : "",
      role: editing ? editing.role : "waiter",
    },
    onSubmit: async ({ value }) => {
      if (
        !editing &&
        (!value.fname ||
          !value.lname ||
          !value.username ||
          !value.phone ||
          !value.role ||
          !value.password ||
          value.password.length < 8 ||
          value.password !== value.passwordConfirm)
      )
        return;
      console.log("Sending to FastAPI:", value);
      if (editing) await updateUser({id: editing.id, body: value})
        else await createUser(value);
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        {editing ? (
          <Button
            size="$3"
            circular
            chromeless
            hoverStyle={{ bg: "$amber50" }}
            icon={<Pencil size={18} color="$brandMain" />}
          />
        ) : (
          <Button
            backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
            hoverStyle={{ scale: 1.02 }}
            disabledStyle={{ opacity: 0.5 }}
          >
            <Plus col="white"></Plus>
            <Text col="white" fontWeight="600" fontFamily="$body">
              Nuevo usuario
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
                  <UserIcon col={"$white"} />
                </View>
                <YStack>
                  <Text col={"$white"} fos={"$7"} fow={500} mb={"$2"}>
                    {editing ? "Editar Usuario" : "Nuevo Usuario"}
                  </Text>
                  <Text col={"$amber100"} fos={"$4"}>
                    {editing
                      ? "Actualiza la información del usuario"
                      : "Completa los datos del nuevo usuario"}
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
                <YStack gap={"$2"}>
                  <XStack gap={"$2"} ai={"center"}>
                    <UserIcon size={15} color={"$orange500"} />
                    <Text>Nombre</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="fname"
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
                        placeholder="Saturnino"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  />
                </YStack>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"} ai={"center"}>
                    <UserIcon size={15} color={"$orange500"} />
                    <Text>Apellidos</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="lname"
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
                        placeholder="Mamani"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  />
                </YStack>
              </XStack>
              <XStack gap={"$3"}>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"} ai={"center"}>
                    <AtSign size={15} color={"$orange500"} />
                    <Text>Usuario</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="username"
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
                        placeholder="usuario"
                        value={field.state.value}
                        onChangeText={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  />
                </YStack>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"} ai={"center"}>
                    <Phone size={15} color={"$orange500"} />
                    <Text>Teléfono</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="phone"
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
                    <Text>Rol</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="role"
                    children={(field) => (
                      <Select
                        defaultValue="waiter"
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <Select.Trigger bw={2} w={180}>
                          <Select.Value
                            placeholder="Todos los roles"
                            fos={"$5"}
                          />
                          <ChevronDown pl={"$3"}></ChevronDown>
                        </Select.Trigger>
                        <Select.FocusScope loop trapped focusOnIdle={true}>
                          <Select.Content zIndex={200000}>
                            <Select.ScrollUpButton />
                            <Select.Viewport bw={2}>
                              <Select.Group>
                                <Select.Item
                                  index={1}
                                  value="admin"
                                  hoverStyle={{ backgroundColor: "$gray200" }}
                                >
                                  <Select.ItemText fos={"$5"}>
                                    Admin
                                  </Select.ItemText>
                                </Select.Item>
                                <Select.Item
                                  index={2}
                                  value="waiter"
                                  hoverStyle={{ backgroundColor: "$gray200" }}
                                >
                                  <Select.ItemText fos={"$5"}>
                                    Waiter
                                  </Select.ItemText>
                                </Select.Item>
                                <Select.Item
                                  index={3}
                                  value="kitchen"
                                  hoverStyle={{ backgroundColor: "$gray200" }}
                                >
                                  <Select.ItemText fos={"$5"}>
                                    Kitchen
                                  </Select.ItemText>
                                </Select.Item>
                              </Select.Group>
                            </Select.Viewport>
                            <Select.ScrollDownButton />
                          </Select.Content>
                        </Select.FocusScope>
                      </Select>
                    )}
                  />
                </YStack>
              </XStack>
              <XStack gap={"$3"}>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"}>
                    <Lock size={15} color={"$orange500"} />
                    <Text>Contraseña</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="password"
                    children={(field) => (
                      <XStack ai="center" pos="relative">
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
                          placeholder="••••••••"
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          secureTextEntry={securePassword}
                        />
                        <Button
                          pos="absolute"
                          r={5}
                          chromeless
                          p="$2"
                          onPress={() => setSecurePassword(!securePassword)}
                          icon={
                            securePassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )
                          }
                        />
                      </XStack>
                    )}
                  />
                </YStack>
              </XStack>
              <XStack gap={"$3"}>
                <YStack gap={"$2"} f={1}>
                  <XStack gap={"$2"}>
                    <Lock size={15} color={"$orange500"} />
                    <Text>Confirmar Contraseña</Text>
                    <Text col={"$amber700"}>*</Text>
                  </XStack>
                  <form.Field
                    name="passwordConfirm"
                    children={(field) => (
                      <XStack ai="center" pos="relative">
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
                          placeholder="••••••••"
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          secureTextEntry={secureConfirm}
                        />
                        <Button
                          pos="absolute"
                          r={5}
                          chromeless
                          p="$2"
                          onPress={() => setSecureConfirm(!secureConfirm)}
                          icon={
                            secureConfirm ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )
                          }
                        />
                      </XStack>
                    )}
                  />
                </YStack>
              </XStack>
              <form.Subscribe
                selector={(state) => [
                  state.values.password,
                  state.values.passwordConfirm,
                ]}
              >
                {([pass, confirm]) => {
                  if (!pass || !confirm) return null;
                  const matches = pass === confirm;
                  return (
                    <XStack ai="center" gap="$2" px="$2">
                      <Circle size={8} bg={matches ? "#25ab54" : "#ab2525"} />
                      <Text
                        fos="$2"
                        fontWeight="600"
                        color={matches ? "#25ab54" : "#ab2525"}
                      >
                        {matches
                          ? "Las contraseñas coinciden"
                          : "Las contraseñas no coinciden"}
                      </Text>
                    </XStack>
                  );
                }}
              </form.Subscribe>
              <Separator bw={1.5} />
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
                <form.Subscribe
                  selector={(state) => [
                    state.values.fname,
                    state.values.lname,
                    state.values.username,
                    state.values.phone,
                    state.values.role,
                    state.values.password,
                    state.values.passwordConfirm,
                  ]}
                >
                  {([
                    fname,
                    lname,
                    username,
                    phone,
                    role,
                    password,
                    passwordConfirm,
                  ]) => {
                    return (
                      <Button
                        f={1}
                        disabled={
                          !fname ||
                          !lname ||
                          !username ||
                          !phone ||
                          !role ||
                          !password ||
                          password.length < 8 ||
                          password !== passwordConfirm
                        }
                        backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                        hoverStyle={{ scale: 1.02 }}
                        disabledStyle={{ opacity: 0.5 }}
                      >
                        <Save col="white"></Save>
                        <Text col="white" fontWeight="600" fontFamily="$body">
                          {editing ? "Guardar cambios" : "Guardar Usuario"}
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
