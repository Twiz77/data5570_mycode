import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>

      {/* ✅ Add console.log to check if the button registers a click */}
      <Pressable 
        style={styles.button} 
        onPress={() => {
          console.log("Button Clicked!"); // ✅ Step 2: Debugging
          router.push("/counter"); // Navigation
        }}
      >
        <Text style={styles.buttonText}>GO TO COUNTER</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "blue", padding: 10, borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
});
