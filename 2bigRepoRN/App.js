import React from "react";
import HomeStack from "./routes/homeStack";
import PushNotification from "./shared/pushNotification";
import { NotificationProvider } from "./shared/NotificationContext";
//import Toast from 'react-native-toast-message';


export default function App() {
  return (
    <>
      <NotificationProvider>
        <HomeStack />
        <PushNotification />
        {/* <Toast ref={(ref) => Toast.setRef(ref)} />  */}
      </NotificationProvider>
    </>
  );
}
