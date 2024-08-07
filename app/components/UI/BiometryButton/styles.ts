/* eslint-disable import/prefer-default-export */
import { StyleSheet } from 'react-native';

// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStyles = (colors: any) =>
  StyleSheet.create({
    fixCenterIcon: {
      marginBottom: -3,
    },
    image: {
      height: 24,
      width: 24,
      tintColor: colors.text.default,
    },
    hitSlop: {
      top: 10,
      left: 10,
      bottom: 10,
      right: 10,
    },
  });
