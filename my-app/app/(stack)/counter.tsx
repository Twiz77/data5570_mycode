import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement, reset } from "@/redux/counterSlice";
import type { AppDispatch, RootState } from "@/redux/store";

export default function CounterScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const count = useSelector((state: RootState) => state.counter.value);

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Count: {count}</Text>

      <TouchableOpacity onPress={() => dispatch(increment())} style={styles.button}>
        <Text style={styles.buttonText}>Increment</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(decrement())} style={styles.button}>
        <Text style={styles.buttonText}>Decrement</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(reset())} style={styles.button}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  counterText: { fontSize: 32, fontWeight: "bold", marginBottom: 30 },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: { color: "white", fontSize: 16 },
});
