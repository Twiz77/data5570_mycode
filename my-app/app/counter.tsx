import { View, Button, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { increment, decrement, reset } from "../redux/counterSlice";
import CounterDisplay from "@/components/CounterDisplay";
import type { AppDispatch } from "../redux/store";

export default function CounterScreen() {
  const dispatch: AppDispatch = useDispatch();

  return (
    <View style={styles.container}>
      <CounterDisplay /> {/* Child Component */}
      <Button title="Increment" onPress={() => dispatch(increment())} />
      <Button title="Decrement" onPress={() => dispatch(decrement())} />
      <Button title="Reset" onPress={() => dispatch(reset())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
