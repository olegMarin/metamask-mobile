'use strict';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Image
} from 'react-native';
import NfcManager, { Ndef, NfcEvents, NfcTech } from 'react-native-nfc-manager';
import { useTheme } from '../../../util/theme';

import createStyles from './styles';
import { NFC_PREFIX } from 'app/constants/hito';

const nfcImage = require('images/nfc.png'); // eslint-disable-line import/no-commonjs

interface NfcBroadcastProps {
    visible: boolean;
    purpose: 'sync' | 'sign';
    aesToken: string;
    onNfcBroadcastSuccess: () => void;
    onErrorNoSupportedNFC: () => void;
    currency?: string;
    currencyNumberStandart?: string;
    account?: string;
}

const NfcBroadcast = (props: NfcBroadcastProps) => {
    const [hasNfc, setHasNFC] = useState(false);

    const theme = useTheme();
    const styles = createStyles(theme);
    const checkIsSupported = async () => {
        const deviceIsSupported = await NfcManager.isSupported();

        setHasNFC(deviceIsSupported);
        if (deviceIsSupported) {
            await NfcManager.start()
            writeNFC();
        }else{
            props.onErrorNoSupportedNFC();
        }
    }
    useEffect(() => {
        checkIsSupported()
    }, [])
    
    const writeNFC = async() => {
        let result = false;
        let comandString = NFC_PREFIX + props.aesToken;
        try {
          await NfcManager.requestTechnology(NfcTech.Ndef);
          const bytes = Ndef.encodeMessage([Ndef.uriRecord(comandString)]);
    
          if (bytes) {
            await NfcManager.ndefHandler
              .writeNdefMessage(bytes);
            result = true;
          }
        } catch (ex) {
          console.warn(ex);
        } finally {
          NfcManager.cancelTechnologyRequest();
          props.onNfcBroadcastSuccess();
          return result;
        }
    
      }

  return (
    <Fragment>
      {props.visible && <Image source={nfcImage} style={styles.frame} />}
    </Fragment>
  )
}
export default NfcBroadcast