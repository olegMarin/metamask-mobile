import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Engine from '../../../core/Engine';
import AccountSelector from '../../UI/HardwareWallet/AccountSelector';
import ConnectHitoInstruction from './Instruction';
import Icon, { IconSize, IconName, IconColor } from '../../../component-library/components/Icons/Icon';
import BlockingActionModal from '../../UI/BlockingActionModal';
import { strings } from '../../../../locales/i18n';
import { UR } from '@ngraveio/bc-ur';
import Alert, { AlertType } from '../../Base/Alert';
import { MetaMetricsEvents } from '../../../core/Analytics';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Device from '../../../util/device';
import { useTheme } from '../../../util/theme';
import { SUPPORTED_UR_TYPE } from '../../../constants/hito';
import { fontStyles } from '../../../styles/common';
import Logger from '../../../util/Logger';
import { removeAccountsFromPermissions } from '../../../core/Permissions';
import { safeToChecksumAddress } from '../../../util/address';
import { useMetrics } from '../../../components/hooks/useMetrics';
import type { MetaMaskKeyring as HitoKeyring } from '@keystonehq/metamask-airgapped-keyring';
import { KeyringTypes } from '@metamask/keyring-controller';
import BannerAlert from 'app/component-library/components/Banners/Banner/variants/BannerAlert';
import { BannerVariant } from 'app/component-library/components/Banners/Banner';
import AnimatedHitoQRScannerModal from 'app/components/UI/HitoHardware/AnimatedHitoQRScanner';
import AnimatedHitoNFCModal from '../../UI/HitoHardware/AnimatedHitoNFCModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IConnectHitoHardwareProps {
  navigation: any;
}
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      marginTop: Device.isIphoneX() ? 50 : 20,
      flexDirection: 'row',
      width: '100%',
      paddingHorizontal: 32,
      alignItems: 'center',
    },
    navbarRightButton: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      height: 48,
      width: 48,
      flex: 1,
    },
    closeIcon: {
      fontSize: 28,
      color: colors.text.default,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    error: {
      ...fontStyles.normal,
      fontSize: 14,
      color: colors.red,
    },
    text: {
      color: colors.text.default,
      fontSize: 14,
      ...fontStyles.normal,
    },
  });

/**
 * Initiate a Hito hardware wallet connection
 
 */
async function initiateHitoHardwareConnection(
  page: 0 | 1 | -1,
): Promise<
  [
    Pick<HitoKeyring, 'cancelSync' | 'submitCryptoAccount' | 'submitCryptoHDKey'>,
    ReturnType<
      (typeof Engine)['context']['KeyringController']['connectQRHardware'] //may be connectHitoHardware in a future
    >,
  ]
> {
  const KeyringController = Engine.context.KeyringController;

  const HitoInteractions = await KeyringController.withKeyring(
    { type: KeyringTypes.qr },
    // @ts-expect-error The Hito Keyring type is not compatible with our keyring type yet
    async (keyring: HitoKeyring) => ({
      cancelSync: keyring.cancelSync.bind(keyring),
      submitCryptoAccount: keyring.submitCryptoAccount.bind(keyring),
      submitCryptoHDKey: keyring.submitCryptoHDKey.bind(keyring),
    }),
    { createIfMissing: true },
  );

  const connectHitoHardwarePromise = KeyringController.connectQRHardware(page); //may be connectHitoHardware in a future

  return [HitoInteractions, connectHitoHardwarePromise];
}

const ConnectHitoHardware = ({ navigation }: IConnectHitoHardwareProps) => {
  const { colors } = useTheme();
  const { trackEvent } = useMetrics();
  const styles = createStyles(colors);

  const KeyringController = useMemo(() => {
    const { KeyringController: keyring } = Engine.context as any;
    return keyring;
  }, []);

  const [HitoState, setHitoState] = useState({
    sync: {
      reading: false,
    },
  });
  const [scannerVisible, setScannerVisible] = useState(false);
  const [nfcVisible, setNfcVisible] = useState(false);
  const [isShowHitoNfcModal, setShowHitoNfcModal] = useState(true);
  const [blockingModalVisible, setBlockingModalVisible] = useState(false);
  const [accounts, setAccounts] = useState<
    { address: string; index: number; balance: string }[]
  >([]);
  const [errorMsg, setErrorMsg] = useState('');
  const resetError = useCallback(() => {
    setErrorMsg('');
  }, []);

  const [existingAccounts, setExistingAccounts] = useState<string[]>([]);

  const showScanner = useCallback(() => {
    setScannerVisible(true);
  }, []);

  const hideScanner = useCallback(() => {
    setScannerVisible(false);
  }, []);


  const readIsShowHitoNfcModalData = async () => {
    try {
      let value = await AsyncStorage.getItem('isShowHitoNfcModal');
      if (value !== null) {
        setShowHitoNfcModal(JSON.parse(value));
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  const onToggleShowNfcModule = async () => {
    try {
      let value = JSON.stringify(!isShowHitoNfcModal);
      await AsyncStorage.setItem('isShowHitoNfcModal', value);
    } catch (error) {
      // Error retrieving data
    } finally {
      setShowHitoNfcModal(!isShowHitoNfcModal);
    }
  }

  const hideNfc = () => {
    setNfcVisible(false);
  }

  const showNfc = () => {
    setNfcVisible(true);
  }

  const onNfcBroadcastSuccess = () => {
    setNfcVisible(false);
    setScannerVisible(true);
  }

  useEffect(() => {
    readIsShowHitoNfcModalData();
  }, []);


  useEffect(() => {
    KeyringController.getAccounts().then((value: string[]) => {
      setExistingAccounts(value);
    });
  }, [KeyringController]);

  const subscribeKeyringState = useCallback((storeValue: any) => {
    setHitoState(storeValue);
  }, []);

  useEffect(() => {
    // This ensures that a Hito keyring gets created if it doesn't already exist.
    // This is intentionally not awaited (the subscription still gets setup correctly if called
    // before the keyring is created).
    // TODO: Stop automatically creating keyrings
    Engine.context.KeyringController.getOrAddQRKeyring();
    Engine.controllerMessenger.subscribe(
      'KeyringController:qrKeyringStateChange',
      subscribeKeyringState,
    );
    return () => {
      Engine.controllerMessenger.unsubscribe(
        'KeyringController:qrKeyringStateChange',
        subscribeKeyringState,
      );
    };
  }, [KeyringController, subscribeKeyringState]);

  useEffect(() => {
    if (HitoState.sync.reading) {
      if (Platform.OS === 'ios' || !isShowHitoNfcModal) {
        showScanner();
      } else {
        showNfc();
      }
    } else {
      hideScanner();
    }
  }, [HitoState.sync, hideScanner, showScanner]);

  const HitoInteractionsRef =
    useRef<
      Pick<
        HitoKeyring,
        'cancelSync' | 'submitCryptoAccount' | 'submitCryptoHDKey'
      >
    >();

  const onConnectHardware = useCallback(async () => {
    trackEvent(MetaMetricsEvents.CONTINUE_HITO_HARDWARE_WALLET, {
      device_type: 'Hito Hardware',
    });
    resetError();
    const [HitoInteractions, connectHitoHardwarePromise] = await initiateHitoHardwareConnection(0);

    HitoInteractionsRef.current = HitoInteractions;
    const firstPageAccounts = await connectHitoHardwarePromise;
    delete HitoInteractionsRef.current;

    setAccounts(firstPageAccounts);
  }, [resetError, trackEvent]);

  const onScanSuccess = useCallback(
    (ur: UR) => {
      hideScanner();
      trackEvent(MetaMetricsEvents.CONNECT_HARDWARE_WALLET_SUCCESS, {
        device_type: 'Hito Hardware',
      });
      if (!HitoInteractionsRef.current) {
        const errorMessage = 'Missing Hito keyring interactions';
        setErrorMsg(errorMessage);
        throw new Error(errorMessage);
      }
      if (ur.type === SUPPORTED_UR_TYPE.CRYPTO_HDKEY) {
        HitoInteractionsRef.current.submitCryptoHDKey(ur.cbor.toString('hex'));
      } else {
        HitoInteractionsRef.current.submitCryptoAccount(ur.cbor.toString('hex'));
      }
      resetError();
    },
    [hideScanner, resetError, trackEvent],
  );

  const onScanError = useCallback(
    async (error: string) => {
      hideScanner();
      setErrorMsg(error);
      if (HitoInteractionsRef.current) {
        HitoInteractionsRef.current.cancelSync();
      }
    },
    [hideScanner],
  );

  const nextPage = useCallback(async () => {
    resetError();
    const [HitoInteractions, connectHitoHardwarePromise] =
      await initiateHitoHardwareConnection(1);

    HitoInteractionsRef.current = HitoInteractions;
    const nextPageAccounts = await connectHitoHardwarePromise;
    delete HitoInteractionsRef.current;

    setAccounts(nextPageAccounts);
  }, [resetError]);

  const prevPage = useCallback(async () => {
    resetError();
    const [HitoInteractions, connectHitoHardwarePromise] =
      await initiateHitoHardwareConnection(1);

    HitoInteractionsRef.current = HitoInteractions;
    const previousPageAccounts = await connectHitoHardwarePromise;
    delete HitoInteractionsRef.current;

    setAccounts(previousPageAccounts);
  }, [resetError]);

  const onToggle = useCallback(() => {
    resetError();
  }, [resetError]);

  const onUnlock = useCallback(
    async (accountIndexs: number[]) => {
      resetError();
      setBlockingModalVisible(true);
      try {
        for (const index of accountIndexs) {
          await KeyringController.unlockHitoHardwareWalletAccount(index);
        }
      } catch (err) {
        Logger.log('Error: Connecting Hito hardware wallet', err);
      }
      setBlockingModalVisible(false);
      navigation.pop(2);
    },
    [KeyringController, navigation, resetError],
  );

  const onForget = useCallback(async () => {
    resetError();
    // removedAccounts and remainingAccounts are not checksummed here.
    const { removedAccounts, remainingAccounts } =
      await KeyringController.forgetHitoDevice();
    Engine.setSelectedAddress(remainingAccounts[remainingAccounts.length - 1]);
    const checksummedRemovedAccounts = removedAccounts.map(
      safeToChecksumAddress,
    );
    removeAccountsFromPermissions(checksummedRemovedAccounts);
    navigation.pop(2);
  }, [KeyringController, navigation, resetError]);

  const renderAlert = () =>
    errorMsg !== '' && (
      <BannerAlert variant={BannerVariant.Alert} onClose={resetError}>
        <Text style={styles.error}>{errorMsg}</Text>
      </BannerAlert>
    );

  return (
    <Fragment>
      <View style={styles.container}>
        <View style={styles.header}>

          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.navbarRightButton}
          >
            <Icon
              name={IconName.WalletCard}
              size={IconSize.Lg}
              style={styles.actionBtn}
              color={IconColor.Default}
            />
          </TouchableOpacity>
        </View>
        {accounts.length <= 0 ? (
          <ConnectHitoInstruction
            onConnect={onConnectHardware}
            renderAlert={renderAlert}
            navigation={navigation}
          />
        ) : (
          <AccountSelector
            accounts={accounts}
            selectedAccounts={existingAccounts}
            nextPage={nextPage}
            prevPage={prevPage}
            toggleAccount={onToggle}
            onUnlock={onUnlock}
            onForget={onForget}
            title={strings('connect_Hito_hardware.select_accounts')}
          />
        )}
      </View>
      <AnimatedHitoQRScannerModal
        visible={scannerVisible}
        purpose={'sync'}
        onScanSuccess={onScanSuccess}
        onScanError={onScanError}
        hideModal={hideScanner} />
      <AnimatedHitoNFCModal
        visible={nfcVisible}
        purpose={'sync'}
        isShowNfcModule={isShowHitoNfcModal}
        onToggleShowNfcModule={onToggleShowNfcModule}
        onNfcBroadcastSuccess={onNfcBroadcastSuccess}
        hideModal={hideNfc}
      ></AnimatedHitoNFCModal>

      <BlockingActionModal modalVisible={blockingModalVisible} isLoadingAction>
        <Text style={styles.text}>
          {strings('connect_Hito_hardware.please_wait')}
        </Text>
      </BlockingActionModal>
    </Fragment>
  );
};

export default ConnectHitoHardware;
