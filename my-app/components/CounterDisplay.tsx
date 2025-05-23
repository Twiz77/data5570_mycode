import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function CounterDisplay() {
  const counter = useSelector((state: RootState) => state.counter.value);

  return (
    <View style={styles.container}>
      <Text>Counter: {counter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
