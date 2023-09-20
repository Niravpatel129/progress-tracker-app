import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  carouselContainer: {
    height: 80,
    backgroundColor: "white",
    marginBottom: 10,
    marginRight: 60,
  },
  carouselImage: {
    width: 60,
    height: 80,
    marginRight: 1,
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
    bottom: 15,
    fontSize: 20,
    textAlign: "center",
    width: "100%",
    color: "white",
    zIndex: 2,
  },
  weight: {
    position: "absolute",
    bottom: 50,
    fontSize: 44,
    textAlign: "center",
    width: "100%",
    color: "white",
    zIndex: 2,
  },
});
