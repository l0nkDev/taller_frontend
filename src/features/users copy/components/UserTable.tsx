import { Search, ChevronDown, Shield, User as UserIcon, ChefHat } from "@tamagui/lucide-icons";
import { XStack, YStack, Select, Circle, Text } from "tamagui";
import { UserDialog } from "./UserDialog";
import { useGetUsersQuery } from "../../../api/usersApi";
import { useState } from "react";
import { Input } from "../../../components/Input";
import { DeleteUserDialog } from "./DeleteUserDialog";

const RoleBadge = ({ role }: { role: string }) => {
  const isAdmin = role === "admin";
  const isWaiter = role === "waiter";

  const bgColor = isAdmin ? "#ede9fe" : isWaiter ? "#e0f2fe" : "#ffedd5";
  const textColor = isAdmin ? "#6d28d9" : isWaiter ? "#0369a1" : "#c2410c";
  const boc = isAdmin ? "#6d28d944" : isWaiter ? "#0369a144" : "#c2410c44";
  const Icon = isAdmin ? Shield : isWaiter ? UserIcon : ChefHat;

  return (
    <XStack
      bg={bgColor}
      px="$3"
      py="$1.5"
      br="$10"
      bw={2}
      boc={boc}
      ai="center"
      gap="$2"
      als="flex-start"
    >
      <Icon size={14} color={textColor} />
      <Text fos="$4" color={textColor} tt="capitalize">
        {role}
      </Text>
    </XStack>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <XStack
    bg={isActive ? "#dcfce7" : "#fee2e2"}
    bw={2}
    boc={isActive ? "#dcfce7" : "#fee2e2"}
    px="$3"
    py="$1.5"
    br="$10"
    als="flex-start"
  >
    <Text fos="$4" color={isActive ? "#166534" : "#991b1b"}>
      {isActive ? "Activo" : "Inactivo"}
    </Text>
  </XStack>
);

export function UserTable() {
  const { data } = useGetUsersQuery();
  const [searchArg, setSearchArg] = useState("");
  const [roleArg, setRoleArg] = useState("any");
  
  return (
    <>
      <XStack
        px="$5"
        py="$3"
        bw={2}
        boc="$cardBorder"
        bg="$cardBg"
        br="$6"
        ai="center"
        gap="$3"
      >
        <XStack ai="center" pos="relative" f={1}>
          <YStack pos="absolute" l={12} zi={1}>
            <Search size={20} />
          </YStack>
          <Input
            fos={"$5"}
            f={1}
            pl={45}
            bw={2}
            bc="$cardBorder"
            bg="$cardBg"
            outlineStyle="none"
            outlineColor="transparent"
            focusStyle={{
              boc: "$brandMain",
            }}
            placeholder="Buscar..."
            value={searchArg}
            onChangeText={(v) => setSearchArg(v.toLowerCase())}
          />
        </XStack>
        <YStack>
          <Select defaultValue="ANY" value={roleArg} onValueChange={setRoleArg}>
            <Select.Trigger bw={2} w={180}>
              <Select.Value placeholder="Todos los roles" fos={"$5"} />
              <ChevronDown pl={"$3"}></ChevronDown>
            </Select.Trigger>
            <Select.FocusScope loop trapped focusOnIdle={true}>
              <Select.Content>
                <Select.ScrollUpButton />
                <Select.Viewport bw={2}>
                  <Select.Group>
                    <Select.Item
                      index={0}
                      value="any"
                      hoverStyle={{ backgroundColor: "$gray200" }}
                    >
                      <Select.ItemText fos={"$5"}>
                        Todos los roles
                      </Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      index={1}
                      value="admin"
                      hoverStyle={{ backgroundColor: "$gray200" }}
                    >
                      <Select.ItemText fos={"$5"}>Admin</Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      index={2}
                      value="waiter"
                      hoverStyle={{ backgroundColor: "$gray200" }}
                    >
                      <Select.ItemText fos={"$5"}>Waiter</Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      index={3}
                      value="kitchen"
                      hoverStyle={{ backgroundColor: "$gray200" }}
                    >
                      <Select.ItemText fos={"$5"}>Kitchen</Select.ItemText>
                    </Select.Item>
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select.FocusScope>
          </Select>
        </YStack>
        <UserDialog editing={null} />
      </XStack>
      <YStack
        bg="$cardBg"
        br="$6"
        bw={2}
        boc="$cardBorder"
        overflow="hidden"
        elevation="$1"
      >
        <XStack
          backgroundImage="linear-gradient(to bottom right, var(--amber100), var(--orange100))"
          px="$5"
          py="$3"
          borderBottomWidth={2}
          boc="$cardBorder"
          ai="center"
        >
          <Text f={2} fb={0} fos="$5" fontWeight="bold" color="$secondaryText">
            Usuario
          </Text>
          <Text f={2} fb={0} fos="$5" fontWeight="bold" color="$secondaryText">
            Contacto
          </Text>
          <Text f={1} fb={0} fos="$5" fontWeight="bold" color="$secondaryText">
            Rol
          </Text>
          <Text f={1} fb={0} fos="$5" fontWeight="bold" color="$secondaryText">
            Estado
          </Text>
          <Text
            f={0.5}
            fb={0}
            fos="$5"
            fontWeight="bold"
            color="$secondaryText"
            ta="center"
          >
            Acciones
          </Text>
        </XStack>
        <YStack>
          {data &&
            data
              .filter(
                (user) =>
                  (searchArg.length === 0 ||
                    `${user.fname} ${user.lname}`
                      .toLowerCase()
                      .includes(searchArg)) &&
                  (roleArg === "any" || user.role === roleArg),
              )
              .map((user, index) => (
                <XStack
                  key={user.id}
                  px="$5"
                  py="$4"
                  ai="center"
                  borderBottomWidth={index === data.length - 1 ? 0 : 1}
                  boc="$cardBorder"
                  hoverStyle={{ bg: "$bgGradientStart" }}
                >
                  <XStack
                    f={2}
                    fb={0}
                    ai="center"
                    gap="$3"
                    overflow="hidden"
                    pr="$3"
                  >
                    <Circle size={40} bg="$amber50" bw={1} boc="$amber200">
                      <UserIcon size={20} color="$brandMain" />
                    </Circle>
                    <YStack f={1}>
                      <Text
                        fos="$5"
                        fontWeight="bold"
                        color="$primaryText"
                        numberOfLines={1}
                      >
                        {user.fname} {user.lname}
                      </Text>
                      <Text fos="$3" color="$secondaryText" numberOfLines={1}>
                        @{user.username}
                      </Text>
                    </YStack>
                  </XStack>
                  <XStack f={2} fb={0} ai="center" gap="$3">
                    <Text fos="$5" color="$secondaryText">
                      {user.phone}
                    </Text>
                  </XStack>
                  <XStack f={1} fb={0}>
                    <RoleBadge role={user.role} />
                  </XStack>
                  <XStack f={1} fb={0}>
                    <StatusBadge isActive={user.is_active} />
                  </XStack>
                  {user.is_active ? <XStack f={0.5} fb={0} jc="center" gap="$2">
                    <UserDialog editing={user}/>
                    <DeleteUserDialog userId={user.id}/>
                  </XStack>: <XStack f={0.5} fb={0} jc="center" gap="$2"/>}
                </XStack>
              ))}
        </YStack>
      </YStack>
    </>
  );
}
