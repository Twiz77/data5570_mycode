import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { postCustomer } from "@/redux/customerSlice";

export default function AddCustomerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = () => {
    if (!name || !email) {
      Alert.alert("Please enter both name and email.");
      return;
    }

    dispatch(postCustomer({ name, email }))
      .unwrap()
      .then(() => {
        setName("");
        setEmail("");
        Alert.alert("Customer added successfully!");
      })
      .catch(() => {
        Alert.alert("Failed to add customer.");
      });
  };

  return (
    <View style={styles.form}>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Add Customer" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});
