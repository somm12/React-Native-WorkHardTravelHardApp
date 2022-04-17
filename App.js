import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, FontAwesome5 } from "@expo/vector-icons";
const STORAGE_KEY = "@toDos";
const RECENT_MODE_KEY = "@recentMode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [complete, setComplete] = useState(false);
  const [editText, setEditText] = useState("");
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
    loadRecentMode();
  }, []);
  useEffect(() => {
    changeRecentMode();
  }, [working]);
  useEffect(() => {
    loadToDos();
  }, [complete]);
  const travel = () => {
    setWorking(false);
  };
  const work = () => {
    setWorking(true);
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (edit) => {
    setEditText(edit);
  };
  const changeRecentMode = async () => {
    try {
      await AsyncStorage.setItem(RECENT_MODE_KEY, JSON.stringify(working));
    } catch (e) {
      console.log("failed to save recent mode working/travel");
    }
  };
  const loadRecentMode = async () => {
    try {
      const s = await AsyncStorage.getItem(RECENT_MODE_KEY);
      s !== null ? setWorking(JSON.parse(s)) : null;
    } catch (e) {
      console.log("failed to load recent mode work/travel");
    }
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log("failed to save toDos");
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);

      s !== null ? setToDos(JSON.parse(s)) : null;
    } catch (e) {
      console.log("failed to load toDos");
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { complete, text, working } };

    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const editAlert = () => {
    Alert.alert("Edit To Do", "Touch the line", [{ text: "OK" }]);
  };
  const editToDo = (key) => {
    if (editText === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    newToDos[key].complete = false;
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditText("");
  };
  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].complete = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
    return;
  };
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        returnKeyType="done"
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        style={styles.input}
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      ></TextInput>
      {toDos.length === 0 ? (
        <View>
          <ActivityIndicator color="white" size="large" />
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <TextInput
                  returnKeyType="done"
                  onChangeText={onChangeEditText}
                  onSubmitEditing={() => editToDo(key)}
                  style={
                    toDos[key].complete === true
                      ? styles.toDoTextComplete
                      : styles.toDoText
                  }
                >
                  {toDos[key].text}
                </TextInput>

                <View style={styles.iconBox}>
                  <TouchableOpacity
                    onPress={() => {
                      completeToDo(key);
                    }}
                  >
                    <FontAwesome5
                      name="check"
                      size={20}
                      style={styles.icon}
                      color={theme.grey}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={editAlert}>
                    <FontAwesome5
                      name="edit"
                      size={20}
                      style={styles.icon}
                      color={theme.grey}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Fontisto
                      name="trash"
                      size={20}
                      style={styles.icon}
                      color={theme.grey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 80,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  iconBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toDoTextComplete: {
    textDecorationLine: "line-through",
    color: "#ffb5b5",
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 5,
  },
});
