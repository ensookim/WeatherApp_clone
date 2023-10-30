import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Ionicons} from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const icons = {
  Clouds : "cloudy",
  Clear : "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow :"snowflake-3",
  Rain : "rains",
  Drizzle: "rain",
}


const API_KEY = "24aecf9ba5b6d4dccbd6b66cbc3211e6";

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]); // Initialize days as an empty array
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
      return;
    }

    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });

    setCity(location[0].city);

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const json = await response.json();
      setDays(
        json.list.filter((weather) => {
          if (weather.dt_txt.includes("00:00:00")) {
            return weather;
          }
        })
      );
    } catch (error) {
      console.error(error);
      setDays([]); // Set days to an empty array in case of an error
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityname}>{city}</Text>
      </View>
      <ScrollView
        showsHorizontalScrollIndicator={true}
        pagingEnabled
        horizontal
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={{...styles.day, alignItems: "center"}}>
            <ActivityIndicator color="white" style={{ marginTop: 10}}></ActivityIndicator>
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View style={{flexDirection : "row",
               alignContent : "flex-end",
               width : "100%",
               justifyContent: "space-between"}}>
                <Text style={styles.date}>
                {/* {new Date(day.dt *1000).toISOString().substring(0, 10)} */}
                </Text>
                
                <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed(1)}</Text>
                <Fontisto name={icons[day.weather[0].main]} size={68} color="white"  />
              </View>
              
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "skyblue",
    justifyContent: "center",
  },
  city: {
    flex: 1.2,
    marginTop : 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cityname: {
    fontSize: 48,
    fontWeight: "600",
    color: "white",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingHorizontal : 20,
  },
  temp: {
    fontSize: 60,
    fontWeight: "400",
    color: "white",
    marginRight: 150,
  },
  description: {
    fontSize: 28,
    color: "white",
  },
  tinyText: {
    fontSize: 20,
    color: "white",
  },
  date: {
    fontSize: 24,
    
  },
});
