import {
    StyleSheet,
  } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import { Theme } from '../../../util/theme/models';
const createStyles = (theme: Theme) =>
    StyleSheet.create({
      modal: {
        margin: 0,
      },
      container: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.brandColors.black000,
      },
      preview: {
        flex: 1,
      },
      innerView: {
        flex: 1,
      },
      closeIcon: {
        marginTop: 20,
        marginRight: 20,
        width: 40,
        alignSelf: 'flex-end',
      },
      frame: {
        width: 250,
        height: 250,
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.5,
      },
      text: {
        flex: 1,
        fontSize: 17,
        color: theme.brandColors.white000,
        textAlign: 'center',
        justifyContent: 'center',
        marginTop: 100,
      },
      hint: {
        backgroundColor: colors.whiteTransparent,
        width: '100%',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
      },
      hintText: {
        width: 240,
        maxWidth: '80%',
        color: theme.brandColors.black000,
        textAlign: 'center',
        fontSize: 16,
        ...fontStyles.normal,
      },
      bold: {
        ...fontStyles.bold,
      },
    });

export default createStyles;