import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [lastSelfieUri, setLastSelfieUri] = useState(null);
  const [selfieUris, setSelfieUris] = useState([]);
  const flatListRef = useRef(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [showTrashIcon, setShowTrashIcon] = useState(false);
  const [lastVisibleIndex, setLastVisibleIndex] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      const newFileUri = FileSystem.documentDirectory + new Date().getTime() + '.jpg';
      await FileSystem.moveAsync({
        from: photo.uri,
        to: newFileUri,
      });
      setLastSelfieUri(newFileUri);
      setSelfieUris((prevSelfieUris) => [...prevSelfieUris, newFileUri]);
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const toggleCamera = () => {
    // take image if camera is open
    if (!selectedImageUri) {
      takePicture();
    }

    setSelectedImageUri(null);
    setShowTrashIcon(false);
  };

  const deleteSelectedImage = async () => {
    if (selectedImageUri) {
      // Delete the file from the filesystem
      await FileSystem.deleteAsync(selectedImageUri);

      // Remove the URI from selfieUris
      const newSelfieUris = selfieUris.filter((uri) => uri !== selectedImageUri);
      setSelfieUris(newSelfieUris);

      // Update lastSelfieUri if needed
      if (lastSelfieUri === selectedImageUri) {
        setLastSelfieUri(newSelfieUris.length > 0 ? newSelfieUris[newSelfieUris.length - 1] : null);
      }

      // Update selectedImageUri to next available image or null
      setSelectedImageUri(
        newSelfieUris.length > 0 ? newSelfieUris[newSelfieUris.length - 1] : null,
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
    const itemWidth = 100; // This should be the width of your carousel item
    const index = Math.floor(offsetX / itemWidth);
    if (index >= 0 && index < selfieUris.length) {
      setSelectedImageUri(selfieUris[index]);
      setShowTrashIcon(true);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={selectedImageUri ? null : takePicture}>
        <Camera style={{ flex: 1 }} ref={(ref) => setCameraRef(ref)}>
          {lastSelfieUri && !selectedImageUri && (
            <Image source={{ uri: lastSelfieUri }} style={styles.fullScreenImage} />
          )}
          {selectedImageUri && (
            <>
              <Image source={{ uri: selectedImageUri }} style={styles.fullScreenImagePreview} />
              <Text style={styles.imageTitle}>
                {new Date(
                  parseInt(selectedImageUri.split('/').pop().split('.jpg')[0], 10),
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </>
          )}
        </Camera>
      </TouchableWithoutFeedback>
      {showTrashIcon && (
        <TouchableOpacity style={styles.trashIconContainer} onPress={deleteSelectedImage}>
          <Text style={styles.trashIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          onScroll={onScroll} // Adding onScroll event listener
          data={[...selfieUris, { isCameraIcon: true }]}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) =>
            !item.isCameraIcon ? (
              <TouchableOpacity onPress={() => handleImageClick(item)}>
                <Image source={{ uri: item }} style={styles.carouselImage} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={toggleCamera}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    height: 100,
    backgroundColor: 'white',
  },
  carouselImage: {
    width: 100,
    height: 100,
  },
  cameraIcon: {
    fontSize: 48,
    margin: 25,
  },
  fullScreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  fullScreenImagePreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  trashIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 160,
    zIndex: 2,
  },
  trashIcon: {
    fontSize: 36, // Made the icon smaller
  },
  imageTitle: {
    position: 'absolute',
    bottom: 20,
    fontSize: 24,
    textAlign: 'center',
    width: '100%',
    color: 'white',
    zIndex: 2,
  },
});
