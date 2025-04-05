import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "@/redux/customerSlice";
import { RootState, AppDispatch } from "@/redux/store";
import AddCustomerForm from "@/components/AddCustomerForm";

export default function CustomersScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const customers = useSelector((state: RootState) => state.customers.list);
  const loading = useSelector((state: RootState) => state.customers.loading);
  const error = useSelector((state: RootState) => state.customers.error);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customers</Text>

      <AddCustomerForm /> {/* ✅ This is your working form */}

      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  name: { fontSize: 18, fontWeight: "600" },
  email: { fontSize: 14, color: "gray" },
  error: { color: "red", marginBottom: 10 },
});
