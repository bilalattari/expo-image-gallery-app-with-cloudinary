import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";

const imagesArr = [
  "https://images.unsplash.com/photo-1596742578443-7682ef5251cd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9iaWxlJTIwYXBwc3xlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1704018453307-d563498b585b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9iaWxlJTIwYXBwc3xlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9iaWxlJTIwYXBwc3xlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1vYmlsZSUyMGFwcHN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1593789198788-8b21805d5fdb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG1vYmlsZSUyMGFwcHN8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1533022139390-e31c488d69e2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1vYmlsZSUyMGFwcHN8ZW58MHx8MHx8fDA%3D",
];
export default function ImageGallery() {
  const [images, setImages] = useState(imagesArr);

  const uploadImageToCloudinary = async (obj: any) => {
    const cloudName = "dxc9gtsl2";
    const apiKey = "425621276711985";
    const apiSecret = "-BBUPHUpD0ylxw0nF1Jwfuw52as";

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp, apiSecret);

    const formData = new FormData();
    console.log("obj=>", obj);

    formData.append("file", {
      uri: obj.uri,
      name: obj.fileName,
      type: obj.mimeType,
    });

    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", await signature);

    console.log("formData=>", formData);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("data=>", data.secure_url);
      return data.secure_url;
    } else {
      console.log("error=>", data.error.message);
      return data.error.message;
    }
  };
  async function generateSignature(timestamp: any, apiSecret: any) {
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      signatureString
    );

    return digest;
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const link = await uploadImageToCloudinary(result.assets[0]);
      console.log("uploaded link=>", link);
      setImages([link, ...images]);
    }
  };

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log(result);

      if (!result.canceled) {
        const link = await uploadImageToCloudinary(result.assets[0]);
        console.log("uploaded link=>", link);
        setImages([link, ...images]);
      }
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={styles.iconsView}>
        <Entypo
          style={styles.icon}
          onPress={pickImage}
          name="image"
          size={24}
          color="black"
        />
        <Entypo
          style={styles.icon}
          onPress={pickImageFromCamera}
          name="camera"
          size={24}
          color="black"
        />
      </ThemedView>

      <FlatList
        data={images}
        keyExtractor={(data) => data}
        renderItem={({ item }) => {
          return <Image source={{ uri: item }} style={styles.img} />;
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  iconsView: {
    padding: 20,
    position: "absolute",
    zIndex: 12,
    backgroundColor: "transparent",
    right: -10,
    gap: 20,
    flexDirection: "column",
  },
  img: { height: 230, marginVertical: 10 },
  icon: {
    backgroundColor: "#e4eaef",
    padding: 12,
    borderRadius: 125,
  },
});
