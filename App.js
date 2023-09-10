import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

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
  const fakePictures = [
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
    "https://cdn-cafdl.nitrocdn.com/fQHdfFSxWCuDmbpNBOTabVcchzVvBqxc/assets/images/optimized/rev-10d6093/blog/wp-content/uploads/2014/09/Ragdoll1.jpg",
  ];

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const takePicture = async () => {
    const today = new Date();
    if (lastPhotoDate && isSameDay(today, new Date(lastPhotoDate))) {
      alert("You can only take one photo a day.");
      return;
    }

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
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const toggleCamera = () => {
    // if picture for today is taken show a small alert that todays picture is already taken
    if (lastPhotoDate && isSameDay(new Date(lastPhotoDate), new Date())) {
      alert("You can only take one photo a day.");
      return;
    }

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

  const onScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 50;
    const index = Math.floor(offsetX / itemWidth);
    if (index >= 0 && index < selfieUris.length) {
      setSelectedImageUri(selfieUris[index]);
      setShowTrashIcon(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View>
        <Text>Requesting for camera permission</Text>{" "}
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
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          onScroll={onScroll}
          data={fakePictures}
          // data={
          //   lastPhotoDate && isSameDay(new Date(lastPhotoDate), new Date())
          //     ? [...selfieUris]
          //     : [...selfieUris, { isCameraIcon: true }]
          // }
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImageClick(item)}>
              <Image source={{ uri: item }} style={styles.carouselImage} />
            </TouchableOpacity>
          )}
        />
      </View>
      <Text
        onPress={toggleCamera}
        style={{
          position: "absolute",
          bottom: 0,
          color: "#c5c5c5",
          right: 0,
          fontSize: 48,
          margin: 12,
          zIndex: 2,
        }}
      >
        +
      </Text>
    </View>
  );
}
