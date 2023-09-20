import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import ImageCarousel from "./src/components/ImageCarousel/ImageCarousel";
import { styles } from "./src/styles/App.styles";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [lastSelfieUri, setLastSelfieUri] = useState(null);
  const [selfieUris, setSelfieUris] = useState([]);
  const flatListRef = useRef(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [showTrashIcon, setShowTrashIcon] = useState(false);
  const [lastPhotoDate, setLastPhotoDate] = useState(null);

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // useEffect(() => {
  //   // clear the local storage
  //   AsyncStorage.clear();
  // }, []);

  useEffect(() => {
    // Load data from AsyncStorage when component mounts
    const loadData = async () => {
      try {
        const storedUris = await AsyncStorage.getItem("selfieUris");
        const storedLastPhotoDate = await AsyncStorage.getItem("lastPhotoDate");
        if (storedUris !== null && storedLastPhotoDate !== null) {
          setSelfieUris(JSON.parse(storedUris));
          setLastPhotoDate(new Date(JSON.parse(storedLastPhotoDate)));
        }
      } catch (e) {
        console.error("Couldn't load data", e);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Subscribe to updates to selfieUris
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("selfieUris", JSON.stringify(selfieUris));
        await AsyncStorage.setItem(
          "lastPhotoDate",
          JSON.stringify(lastPhotoDate),
        );
      } catch (e) {
        console.error("Couldn't save data", e);
      }
    };

    saveData();
  }, [selfieUris, lastPhotoDate]);

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const takePicture = async () => {
    const today = new Date();
    // if (lastPhotoDate && isSameDay(today, new Date(lastPhotoDate))) {
    //   alert("You can only take one photo a day.");
    //   return;
    // }

    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      const newFileUri =
        FileSystem.documentDirectory + today.getTime() + ".jpg";
      await FileSystem.moveAsync({
        from: photo.uri,
        to: newFileUri,
      });

      setLastPhotoDate(today);
      setLastSelfieUri(newFileUri);
      setSelectedImageUri(newFileUri); // Automatically preview the photo
      setSelfieUris((prevSelfieUris) => [...prevSelfieUris, newFileUri]);

      // wait 5 seconds then do it
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 500);
    }
  };

  const toggleCamera = () => {
    // if picture for today is taken show a small alert that todays picture is already taken
    // if (lastPhotoDate && isSameDay(new Date(lastPhotoDate), new Date())) {
    //   alert("You can only take one photo a day.");
    //   return;
    // }

    // take image if camera is open
    if (!selectedImageUri) {
      takePicture();
    }

    setSelectedImageUri(null);
    setShowTrashIcon(false);
  };

  const webContent = (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#222222",
      }}
    >
      <Text>Camera not available on web.</Text>
    </View>
  );

  const deleteSelectedImage = async () => {
    if (selectedImageUri) {
      if (isSameDay(new Date(), new Date(lastPhotoDate))) {
        setLastPhotoDate(null);
      }

      // Delete the file from the filesystem
      await FileSystem.deleteAsync(selectedImageUri);

      // Remove the URI from selfieUris
      const newSelfieUris = selfieUris.filter(
        (uri) => uri !== selectedImageUri,
      );
      setSelfieUris(newSelfieUris);

      try {
        if (isSameDay(new Date(), new Date(lastPhotoDate))) {
          await AsyncStorage.setItem("lastPhotoDate", JSON.stringify(null));
        }
      } catch (e) {
        console.error("Couldn't save data", e);
      }

      // Update lastSelfieUri if needed
      if (lastSelfieUri === selectedImageUri) {
        setLastSelfieUri(
          newSelfieUris.length > 0
            ? newSelfieUris[newSelfieUris.length - 1]
            : null,
        );
      }

      // Update selectedImageUri to next available image or null
      setSelectedImageUri(
        newSelfieUris.length > 0
          ? newSelfieUris[newSelfieUris.length - 1]
          : null,
      );
      setShowTrashIcon(newSelfieUris.length > 0);
    }
  };

  const handleImageClick = (uri) => {
    setSelectedImageUri(uri);
    setShowTrashIcon(true);
  };

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const lastVisibleItem = viewableItems[viewableItems.length - 1];
      setSelectedImageUri(selfieUris[lastVisibleItem.index]);
      setShowTrashIcon(true);
    }
  };

  const onScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 50; // Replace with the actual width of your items
    const viewWidth = 300; // Replace with the actual width of your FlatList view
    const totalVisibleItems = Math.floor(viewWidth / itemWidth);
    console.log("🚀  totalVisibleItems:", totalVisibleItems);

    const approximateIndex = Math.floor((offsetX + viewWidth) / itemWidth) - 1;

    // Ensure index is within bounds
    const index = Math.min(approximateIndex, selfieUris.length - 1);

    if (index >= 0 && index < selfieUris.length) {
      setSelectedImageUri(selfieUris[index]);
      setShowTrashIcon(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const cameraContent = (
    <TouchableWithoutFeedback onPress={selectedImageUri ? null : takePicture}>
      <Camera style={{ flex: 1 }} ref={(ref) => setCameraRef(ref)}>
        {lastSelfieUri && !selectedImageUri && (
          <Image
            source={{ uri: lastSelfieUri }}
            style={styles.fullScreenImage}
          />
        )}
        {selectedImageUri && (
          <>
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.fullScreenImagePreview}
            />
            <Text style={styles.imageTitle}>
              {new Date(
                parseInt(
                  selectedImageUri.split("/").pop().split(".jpg")[0],
                  10,
                ),
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </>
        )}
      </Camera>
    </TouchableWithoutFeedback>
  );

  return (
    <View style={{ flex: 1 }}>
      {isWeb ? webContent : cameraContent}

      {showTrashIcon && (
        <TouchableOpacity
          style={styles.trashIconContainer}
          onPress={deleteSelectedImage}
        >
          <Text style={styles.trashIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
      <ImageCarousel
        data={selfieUris}
        handleImageClick={handleImageClick}
        flatListRef={flatListRef}
        onScroll={onScroll}
        onViewableItemsChanged={({ viewableItems }) =>
          viewableItemsChanged({ viewableItems })
        }
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50, // Adjust as needed
        }}
      />
      {/* <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          onScroll={onScroll}
          data={fakePictures}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImageClick(item)}>
              <Image source={{ uri: item }} style={styles.carouselImage} />
            </TouchableOpacity>
          )}
        />
      </View> */}
      <Text
        onPress={toggleCamera}
        style={{
          position: "absolute",
          bottom: 10,
          color: "#c5c5c5",
          right: 0,
          fontSize: 58,
          margin: 12,
          zIndex: 2,
        }}
      >
        +
      </Text>
    </View>
  );
}
