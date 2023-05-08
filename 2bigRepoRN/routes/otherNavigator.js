import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginModule from "../screens/loginModule";
import ForgotPasswordModule from "../screens/forgotPasswordModule";
import SignUpModule from "../screens/createAccountModule";

const Stack = createNativeStackNavigator();
export default function OtherNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginModule} />
      <Stack.Screen name="ForgotPass" component={ForgotPasswordModule} />
      <Stack.Screen name="Signup" component={SignUpModule} />
      {/* <Stack.Screen name="Product" component={Products} />
      <Stack.Screen name="ProductDetails" component={ProductsDetails} /> */}
    </Stack.Navigator>
  );
}
