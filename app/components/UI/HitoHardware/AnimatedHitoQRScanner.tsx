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
import { RNCamera } from 'react-native-camera';
import { colors, fontStyles } from '../../../styles/common';
import Icon, { IconSize, IconName, IconColor }  from '../../../component-library/components/Icons/Icon';
import { strings } from '../../../../locales/i18n';
import { URRegistryDecoder } from '@keystonehq/ur-decoder';
import Modal from 'react-native-modal';
import { UR } from '@ngraveio/bc-ur';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { SUPPORTED_UR_TYPE } from '../../../constants/hito';
import { useTheme } from '../../../util/theme';
import { Theme } from '../../../util/theme/models';
import { useMetrics } from '../../hooks/useMetrics';
import createStyles from './styles';
import NfcBroadcast from './NfcBroadcast';

const frameImage = require('images/frame.png'); // eslint-disable-line import/no-commonjs

interface AnimatedHitoScannerProps {
  currentToken: string;
  visible: boolean;
  purpose: 'sync' | 'sign';
  selectedAccount: string[];
  isNfcbroadcastSuccess: boolean;
  onNfcBroadcastSuccess: ()=> void;
  onScanSuccess: (ur: UR) => void;
  onScanError: (error: string) => void;
  hideModal: () => void;
  pauseHitoCode?: (x: boolean) => void;
}

const AnimatedHitoQRScannerModal = (props: AnimatedHitoScannerProps) => {
  const {
    visible,
    onScanError,
    purpose,
    selectedAccount,
    isNfcbroadcastSuccess,
    onNfcBroadcastSuccess,
    onScanSuccess,
    hideModal,
    pauseHitoCode,
    currentToken,
  } = props;

  const [urDecoder, setURDecoder] = useState(new URRegistryDecoder());
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  const { trackEvent } = useMetrics();
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
    setURDecoder(new URRegistryDecoder());
    setProgress(0);
  }, []);

  const hintText = useMemo(
    () => (
      <Text style={styles.hintText}>
        {strings('connect_qr_hardware.hint_text')}
        <Text style={styles.bold}>
          {strings(
            purpose === 'sync'
              ? 'connect_qr_hardware.purpose_connect'
              : 'connect_qr_hardware.purpose_sign',
          )}
        </Text>
      </Text>
    ),
    [purpose, styles],
  );

  const onError = useCallback(
    (error) => {
      if (onScanError && error) {
        trackEvent(MetaMetricsEvents.HARDWARE_WALLET_ERROR, {
          purpose,
          error,
        });
        onScanError(error.message);
      }
    },
    [purpose, onScanError, trackEvent],
  );

  const onBarCodeRead = useCallback(
    (response) => {
      if (!visible) {
        return;
      }
      if (!response.data) {
        return;
      }
      try {
        const content = response.data;
        urDecoder.receivePart(content);
        setProgress(Math.ceil(urDecoder.getProgress() * 100));
        if (urDecoder.isError()) {
          trackEvent(MetaMetricsEvents.HARDWARE_WALLET_ERROR, {
            purpose,
            error: urDecoder.resultError(),
          });
          onScanError(strings('transaction.unknown_qr_code'));
        } else if (urDecoder.isSuccess()) {
          const ur = urDecoder.resultUR();
          if (expectedURTypes.includes(ur.type)) {
            onScanSuccess(ur);
            setProgress(0);
            setURDecoder(new URRegistryDecoder());
          } else if (purpose === 'sync') {
            trackEvent(MetaMetricsEvents.HARDWARE_WALLET_ERROR, {
              purpose,
              received_ur_type: ur.type,
              error: 'invalid `sync` qr code',
            });
            onScanError(strings('transaction.invalid_qr_code_sync'));
          } else {
            trackEvent(MetaMetricsEvents.HARDWARE_WALLET_ERROR, {
              purpose,
              received_ur_type: ur.type,
              error: 'invalid `sign` qr code',
            });
            onScanError(strings('transaction.invalid_qr_code_sign'));
          }
        }
      } catch (e) {
        onScanError(strings('transaction.unknown_qr_code'));
      }
    },
    [
      visible,
      urDecoder,
      onScanError,
      expectedURTypes,
      purpose,
      onScanSuccess,
      trackEvent,
    ],
  );

  const onStatusChange = useCallback(
    (event) => {
      if (event.cameraStatus === 'NOT_AUTHORIZED') {
        onScanError(strings('transaction.no_camera_permission'));
      }
    },
    [onScanError],
  );

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      onModalHide={() => {
        reset();
        pauseHitoCode?.(false);
      }}
      onModalWillShow={() => pauseHitoCode?.(true)}
    >
      <View style={styles.container}>
        <RNCamera
          onMountError={onError}
          captureAudio={false}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          onBarCodeRead={onBarCodeRead} 
          flashMode={RNCamera.Constants.FlashMode.auto}
          androidCameraPermissionOptions={{
            title: strings('qr_scanner.allow_camera_dialog_title'),
            message: strings('qr_scanner.allow_camera_dialog_message'),
            buttonPositive: strings('qr_scanner.ok'),
            buttonNegative: strings('qr_scanner.cancel'),
          }}
          onStatusChange={onStatusChange} 
        >
          <SafeAreaView style={styles.innerView}>
            <TouchableOpacity style={styles.closeIcon} onPress={hideModal}>
              <Icon
              name={IconName.Close}
              size={IconSize.Md}
              style={styles.closeIcon}
              color={IconColor.Default}
            />
            </TouchableOpacity>
            {isNfcbroadcastSuccess?
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
            :
              <Image source={frameImage} style={styles.frame} />
            }
            <Text style={styles.text}>{`${strings('qr_scanner.scanning')} ${
              progress ? `${progress.toString()}%` : ''
            }`}</Text>
          </SafeAreaView>
        </RNCamera>
        <View style={styles.hint}>{hintText}</View>
      </View>
    </Modal>
  );
};

export default AnimatedHitoQRScannerModal;
