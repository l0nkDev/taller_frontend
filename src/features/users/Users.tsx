import { YStack, XStack, Text, H2, View } from "tamagui";
import { CookingPot, ConciergeBell, User, Check } from "@tamagui/lucide-icons";
import { useGetUsersQuery } from "../../api/usersApi";
import { UserTable } from "./components/UserTable";

export function UsersView() {
  const { data } = useGetUsersQuery();

  return (
    <YStack p="$5">
      <YStack mb="$6">
        <H2 fos="$9" color="$primaryText" fontWeight={500}>
          Gestión de Usuarios
        </H2>
        <Text fos="$5" color="$secondaryText" mt="$2">
          Administra el equipo de Tu Café - Cotoca
        </Text>
      </YStack>
      <YStack gap="$5">
        <XStack gap={"$4"}>
          <XStack
            p="$5"
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            ai={"center"}
            jc={"space-between"}
            f={1}
          >
            <YStack>
              <Text fos={"$4"} mb={"$2"}>
                Total Usuarios
              </Text>
              <Text fos={"$8"} fow={500}>
                {data ? data.length : "..."}
              </Text>
            </YStack>
            <View
              w={"$4"}
              h={"$4"}
              br={"$5"}
              bc={"$amber100"}
              ai={"center"}
              jc={"center"}
            >
              <User col={"$amber700"} />
            </View>
          </XStack>
          <XStack
            p="$5"
            bw={2}
            boc="#e0f2fe"
            bg="$cardBg"
            br="$6"
            ai={"center"}
            jc={"space-between"}
            f={1}
          >
            <YStack>
              <Text fos={"$4"} mb={"$2"}>
                Meseros
              </Text>
              <Text fos={"$8"} fow={500}>
                {data ? data.filter((u) => u.role === "waiter").length : "..."}
              </Text>
            </YStack>
            <View
              w={"$4"}
              h={"$4"}
              br={"$5"}
              bc={"#e0f2fe"}
              ai={"center"}
              jc={"center"}
            >
              <ConciergeBell col={"#0369a1"} />
            </View>
          </XStack>
          <XStack
            p="$5"
            bw={2}
            boc="#ffedd5"
            bg="$cardBg"
            br="$6"
            ai={"center"}
            jc={"space-between"}
            f={1}
          >
            <YStack>
              <Text fos={"$4"} mb={"$2"}>
                Personal Cocina
              </Text>
              <Text fos={"$8"} fow={500}>
                {data ? data.filter((u) => u.role === "kitchen").length : "..."}
              </Text>
            </YStack>
            <View
              w={"$4"}
              h={"$4"}
              br={"$5"}
              bc={"#ffedd5"}
              ai={"center"}
              jc={"center"}
            >
              <CookingPot col={"#c2410c"} />
            </View>
          </XStack>
          <XStack
            p="$5"
            bw={2}
            boc="#dcfce7"
            bg="$cardBg"
            br="$6"
            ai={"center"}
            jc={"space-between"}
            f={1}
          >
            <YStack>
              <Text fos={"$4"} mb={"$2"}>
                Usuarios Activos
              </Text>
              <Text fos={"$8"} fow={500}>
                {data ? data.filter((u) => u.is_active).length : "..."}
              </Text>
            </YStack>
            <View
              w={"$4"}
              h={"$4"}
              br={"$5"}
              bc={"#dcfce7"}
              ai={"center"}
              jc={"center"}
            >
              <Check col={"#166534"} />
            </View>
          </XStack>
        </XStack>
        <UserTable />
      </YStack>
    </YStack>
  );
}
