/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint @typescript-eslint/no-require-imports: "off" */

'use strict';
import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import createStyles from './styles';
import Icon, { IconSize, IconName, IconColor }  from '../../../component-library/components/Icons/Icon';
import { strings } from '../../../../locales/i18n';
import { URRegistryDecoder } from '@keystonehq/ur-decoder';
import Modal from 'react-native-modal';
import { UR } from '@ngraveio/bc-ur';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { SUPPORTED_UR_TYPE } from '../../../constants/hito';
import { useTheme } from '../../../util/theme';
import StyledButton from '../StyledButton';
import Button, { ButtonVariants } from 'app/component-library/components/Buttons/Button';
import Checkbox from 'app/component-library/components/Checkbox';
import NfcBroadcast from './NfcBroadcast';


interface AnimatedHitoScannerProps {
  currentToken: string;
  visible: boolean;
  purpose: 'sync' | 'sign';
  onNfcBroadcastSuccess: () => void;
  hideModal: () => void;
  isShowNfcModule: boolean;
  onToggleShowNfcModule: () => void;//use to React.EventHandler<React.SyntheticEvent<any, Event>>;
  onScanError?: (error: string) => void;
  pauseHito?: (x: boolean) => void;
  selectedAccount: string[];
}

const AnimatedHitoNFCModal = (props: AnimatedHitoScannerProps) => {
  const {
    visible,
    purpose,
    hideModal,
    pauseHito,
    onNfcBroadcastSuccess,
    isShowNfcModule,
    onToggleShowNfcModule,
    currentToken,
    selectedAccount,
  } = props;

  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const styles = createStyles(theme);

  let expectedURTypes: string[];
  if (purpose === 'sync') {
    expectedURTypes = [
      SUPPORTED_UR_TYPE.CRYPTO_HDKEY,
      SUPPORTED_UR_TYPE.CRYPTO_ACCOUNT,
    ];
  } else {
    expectedURTypes = [SUPPORTED_UR_TYPE.ETH_SIGNATURE];
  }

  const reset = useCallback(() => {
    setProgress(0);
  }, []);

  const hintText = useMemo(
    () => (
      <Text style={styles.hintText}>
        {strings('connect_hito_hardware.hint_text')}
        <Text style={styles.bold}>
          {strings(
            purpose === 'sync'
              ? 'connect_hito_hardware.purpose_connect'
              : 'connect_hito_hardware.purpose_sign',
          )}
        </Text>
      </Text>
    ),
    [purpose, styles],
  );


  const handlerModalHide =() => {
        reset();
        pauseHito?.(false);
  };

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      onModalHide={handlerModalHide}
      onModalWillShow={() => pauseHito?.(true)}
    >
      <View style={styles.container}>

          <SafeAreaView style={styles.innerView}>
            <TouchableOpacity style={styles.closeIcon} onPress={hideModal}>
              <Icon
              name={IconName.Close}
              size={IconSize.Md}
              style={styles.closeIcon}
              color={IconColor.Default}
            />
            </TouchableOpacity>
            <NfcBroadcast
              visible = {true}
              purpose={purpose}
              currency={currency}
              currencyNumberStandart={currencyNumberStandart}
              account={account}
              aesToken={currentToken}
              onErrorNoSupportedNFC={()=>{}}//used to display error
              onNfcBroadcastSuccess={onNfcBroadcastSuccess}
            />


            <Text style={styles.text}>{`${strings('connect_hito_hardware.scanning')} ${
              progress ? `${progress.toString()}%` : ''
            }`}</Text>
            <Checkbox
              isChecked = {isShowNfcModule}
              onPress = {onToggleShowNfcModule}
              label = {strings('connect_hito_hardware.neverShowHitoNfcModal')}
            ></Checkbox>
            <Button
              label = {strings('connect_hito_hardware.buttonNfcComleate')}
              variant = {ButtonVariants.Primary}
              onPress = {onNfcBroadcastSuccess}
            ></Button>
          </SafeAreaView>
        
        <View style={styles.hint}>{hintText}</View>
      </View>
    </Modal>
  );
};

export default AnimatedHitoNFCModal; 