import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { loginUser } from "../api/auth";
import { Formik } from "formik";
import * as Yup from "yup";
import Icon from "react-native-vector-icons/Ionicons";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureEntry = useCallback(() => {
    setSecureTextEntry((prev) => !prev);
  }, []);

  const handleLogin = useCallback(
    async (values: { email: string; password: string }, { setFieldError }: any) => {
      setLoading(true);
      try {
        const data = await loginUser({ email: values.email, password: values.password });
        if (data?.access_token) {
          navigation.navigate("Dashboard", { token: data.access_token });
        } else {
          setFieldError("general", "Invalid login credentials.");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        setFieldError("general", error.response?.data?.detail || "Login failed. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Text style={styles.title}>Login</Text>
        <Formik initialValues={{ email: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleLogin}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
                {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    secureTextEntry={secureTextEntry}
                    style={[styles.input, { flex: 1 }]}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
                    <Icon name={secureTextEntry ? "eye-off" : "eye"} size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingRight: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  spinner: {
    marginVertical: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  registerText: {
    color: "#007BFF",
    fontSize: 14,
  },
});
