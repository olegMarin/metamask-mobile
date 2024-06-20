/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint @typescript-eslint/no-require-imports: "off" */

import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { strings } from '../../../../../locales/i18n';
import {
  KEYSTONE_LEARN_MORE,
  KEYSTONE_SUPPORT,
  KEYSTONE_SUPPORT_VIDEO,
} from '../../../../constants/urls';
import { useTheme } from '../../../../util/theme';
import { createStyles } from './styles';
import StyledButton from '../../../UI/StyledButton';

interface IConnectHipoInstructionProps {
  navigation: any;
  onConnect: () => void;
  renderAlert: () => false | React.JSX.Element;
}

// eslint-disable-next-line import/no-commonjs
const connectHipoHardwareImg = require('images/connect-qr-hardware.png');

const ConnectHipoInstruction = (props: IConnectHipoInstructionProps) => {
  const { onConnect, renderAlert, navigation } = props;
  const theme = useTheme();
  const styles = createStyles(theme);

  const navigateToVideo = () => {
    navigation.navigate('Webview', {
      screen: 'SimpleWebview',
      params: {
        url: KEYSTONE_SUPPORT_VIDEO,
        title: strings('connect_hito_hardware.description2'),
      },
    });
  };
  const navigateToLearnMore = () => {
    navigation.navigate('Webview', {
      screen: 'SimpleWebview',
      params: {
        url: KEYSTONE_LEARN_MORE,
        title: strings('connect_hito_hardware.keystone'),
      },
    });
  };
  const navigateToTutorial = () => {
    navigation.navigate('Webview', {
      screen: 'SimpleWebview',
      params: {
        url: KEYSTONE_SUPPORT,
        title: strings('connect_hito_hardware.description4'),
      },
    });
  };
  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollWrapper}
      >
        <Text style={styles.title}>{strings('connect_hito_hardware.title')}</Text>
        {renderAlert()}
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            {strings('connect_hito_hardware.description1')}
          </Text>
          <Text style={[styles.text, styles.link]} onPress={navigateToVideo}>
            {strings('connect_hito_hardware.description2')}
          </Text>
          <Text style={styles.text}>
            {strings('connect_hito_hardware.description3')}
          </Text>
          <Text style={styles.keystone}>
            {strings('connect_hito_hardware.keystone')}
          </Text>
          <View style={styles.buttonGroup}>
            <Text
              style={[styles.text, styles.link, styles.linkMarginRight]}
              onPress={navigateToLearnMore}
            >
              {strings('connect_hito_hardware.learnMore')}
            </Text>
            <Text
              style={[styles.text, styles.link]}
              onPress={navigateToTutorial}
            >
              {strings('connect_hito_hardware.tutorial')}
            </Text>
          </View>
          <Text style={styles.text}>
            {strings('connect_hito_hardware.description5')}
          </Text>
          <Text style={styles.text}>
            {strings('connect_hito_hardware.description6')}
          </Text>
        </View>
        <Image
          style={styles.image}
          source={connectHipoHardwareImg}
          resizeMode={'contain'}
        />
      </ScrollView>
      <View style={styles.bottom}>
        <StyledButton
          type={'confirm'}
          onPress={onConnect}
          style={styles.button}
        >
          {strings('connect_hito_hardware.button_continue')}
        </StyledButton>
      </View>
    </View>
  );
};

export default ConnectHipoInstruction;
