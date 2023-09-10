import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  carouselContainer: {
    height: 60,
    backgroundColor: "white",
    marginBottom: 10,
    marginRight: 60,
  },
  carouselImage: {
    width: 50,
    height: 60,
  },
  cameraIcon: {
    fontSize: 48,
    margin: 25,
  },
  fullScreenImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  fullScreenImagePreview: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  trashIconContainer: {
    position: "absolute",
    right: 20,
    bottom: 160,
    zIndex: 2,
  },
  trashIcon: {
    fontSize: 36, // Made the icon smaller
  },
  imageTitle: {
    position: "absolute",
    bottom: 20,
    fontSize: 24,
    textAlign: "center",
    width: "100%",
    color: "white",
    zIndex: 2,
  },
});
