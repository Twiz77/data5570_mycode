import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>

      <Link href="/counter" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>GO TO COUNTER</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/customers-list" asChild>
        <TouchableOpacity style={[styles.button, { backgroundColor: "green" }]}>
          <Text style={styles.buttonText}>GO TO CUSTOMERS</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold",
