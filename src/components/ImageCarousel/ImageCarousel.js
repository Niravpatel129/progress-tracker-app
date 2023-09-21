// ImageCarousel.js
import React from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";

import { styles } from "../../styles/App.styles";

const ImageCarousel = ({ data, handleImageClick, flatListRef, onScroll }) => (
  <View style={styles.carouselContainer}>
    <FlatList
      ref={flatListRef}
      onScroll={onScroll}
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => {
        if (!item) {
          return null;
        }

        return (
          <TouchableOpacity onPress={() => handleImageClick(item)}>
            <Image source={{ uri: item }} style={styles.carouselImage} />
          </TouchableOpacity>
        );
      }}
    />
  </View>
);

export default ImageCarousel;
