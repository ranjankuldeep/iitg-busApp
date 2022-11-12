import * as React from "react";
import MapView from "react-native-maps";
import { Marker, Circle } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Button,
  Touchable,
} from "react-native";
import * as Location from "expo-location";
import { useState, useEffect } from "react";

import io from "socket.io-client";

const busNo = "AS022345";
var interval;
let socket;
export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [busNo, setBusNo] = useState();
  const [bool, setBool] = useState(false);
  const [lat, setLat] = useState(26.1887);
  const [long, setLong] = useState(91.6958);

  useEffect(() => {
    const run = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});

      setLat(location.coords.latitude);
      setLong(location.coords.longitude);
    };
    run();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  // console.log(location.coords.latitude);
  // console.log(location.coords.longitude);

  const getLocationHandler = async () => {
    socket = io("https://iitg-bus-track.herokuapp.com", {
      auth: {
        id: `${busNo}`,
        token: "IITG",
      },
    });
    let location = await Location.getCurrentPositionAsync({});
    socket.emit(
      "location",
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      `${busNo}`
    );
  };

  const refershHandler = async () => {
    let location = await Location.getCurrentPositionAsync({});
    socket.emit(
      "location",
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      `${busNo}`
    );
  };

  if (bool) {
    getLocationHandler();
    interval = setInterval(() => {
      console.log("fhdsuhfo");
      refershHandler();
    }, 5000);
  }
  console.log(lat);
  return (
    <React.Fragment>
      <SafeAreaView style={styles.main}>
        <View style={styles.container}>
          <MapView style={styles.map} showsUserLocation={true}></MapView>
        </View>
        <View style={styles.input}>
          {!bool && (
            <TextInput
              placeholder="Enter bus No."
              onChangeText={(busno) => {
                console.log(busno);
                setBusNo(busno);
              }}
            ></TextInput>
          )}
        </View>
        <View style={styles.main}>
          {!bool && (
            <View style={{ marginLeft: 50, marginRight: 50, borderRadius: 80 }}>
              <Button
                title="start tracking"
                onPress={() => {
                  console.log(bool);
                  setBool(true);
                }}
              />
            </View>
          )}
          {bool && (
            <Button
              title="stop tracking"
              onPress={() => {
                socket.disconnect();
                clearInterval(interval);
                console.log(bool);
                setBool(false);
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    alignItems: "center",
    paddingTop: 80,
    borderRadius: 89,
  },
  input: {
    alignItems: "center",
    backgroundColor: "white",
    margin: 10,
    width: Dimensions.get("window").width * 0.9,
    padding: 10,
    justifyContent: "center",

    borderRadius: 20,
  },
  map: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.5,
  },
  touch: {
    alignItems: "center",
  },
  main: {
    backgroundColor: "black",
    flex: 1,
    alignItems: "center",
  },
});
