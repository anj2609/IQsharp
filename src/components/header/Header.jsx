import { View, Text, Image } from 'react-native';
import React from 'react';
import tvImg from '../../../assets/1img.png';
import Style from './Style';

const Header = () => {
  return (
    <View>
      <View>
        <Image source={tvImg} />
      </View>
      <Text>Header</Text>
    </View>
  );
};

export default Header;
