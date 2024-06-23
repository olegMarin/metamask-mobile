'use strict';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Image
} from 'react-native';
import NfcManager, { Ndef, NfcEvents, NfcTech } from 'react-native-nfc-manager';
import { useTheme } from '../../../util/theme';

import createStyles from './styles';

const nfcImage = require('images/nfc.png'); // eslint-disable-line import/no-commonjs

interface NfcBroadcastProps {
    visible: boolean;
    purpose: 'sync' | 'sign';
    currency: string;
    currencyNumberStandart: string;
    account: string;
    aesToken: string;
    onNfcBroadcastSuccess: () => void;
    onErrorNoSupportedNFC: () => void;
}

const NfcBroadcast = async (props: NfcBroadcastProps) => {
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
        let comandString = "hito.pair:"+props.currencyNumberStandart+"h:"+props.currency+"h:"+props.account+"h:"+props.aesToken+"";
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

  if(props.visible){ 
    return ( 
        <Image source={nfcImage} style={styles.frame} />
    );
  }else{
    return (<Fragment></Fragment>);
  }
}
export default NfcBroadcast