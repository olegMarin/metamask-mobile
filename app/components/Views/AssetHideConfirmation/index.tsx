import React, { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import ReusableModal, { ReusableModalRef } from '../../UI/ReusableModal';
import { fontStyles } from '../../../styles/common';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import { useTheme } from '../../../util/theme';

// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStyles = (colors: any) =>
  StyleSheet.create({
    fill: {
      flex: 1,
    },
    screen: { justifyContent: 'center' },
    modal: {
      backgroundColor: colors.background.default,
      borderRadius: 10,
      marginHorizontal: 16,
    },
    bodyContainer: {
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    headerLabel: {
      textAlign: 'center',
      // TODO: Replace "any" with type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(fontStyles.bold as any),
      fontSize: 24,
      marginBottom: 16,
      color: colors.text.default,
    },
    description: {
      textAlign: 'center',
      fontSize: 16,
      // TODO: Replace "any" with type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(fontStyles.normal as any),
      color: colors.text.default,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border.muted,
    },
    buttonsContainer: {
      flexDirection: 'row',
      padding: 16,
    },
    buttonDivider: {
      width: 8,
    },
  });

interface Props {
  route: {
    params: {
      onConfirm: () => void;
    };
  };
}

const AssetHideConfirmation = ({ route }: Props) => {
  const { onConfirm } = route.params;
  const modalRef = useRef<ReusableModalRef>(null);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const triggerCancel = () => modalRef.current?.dismissModal();

  const triggerConfirm = () => {
    modalRef.current?.dismissModal(onConfirm);
  };

  const renderHeader = () => (
    <Text style={styles.headerLabel}>{strings('wallet.hide_token.title')}</Text>
  );

  const renderDescription = () => (
    <Text style={styles.description}>{strings('wallet.hide_token.desc')}</Text>
  );

  const renderButtons = () => (
    <View style={styles.buttonsContainer}>
      <StyledButton
        onPress={triggerCancel}
        containerStyle={styles.fill}
        type={'normal'}
      >
        {strings('wallet.hide_token.cancel_cta')}
      </StyledButton>
      <View style={styles.buttonDivider} />
      <StyledButton
        onPress={triggerConfirm}
        containerStyle={styles.fill}
        type={'confirm'}
      >
        {strings('wallet.hide_token.confirm_cta')}
      </StyledButton>
    </View>
  );

  return (
    <ReusableModal ref={modalRef} style={styles.screen}>
      <View style={styles.modal}>
        <View style={styles.bodyContainer}>
          {renderHeader()}
          {renderDescription()}
        </View>
        <View style={styles.divider} />
        {renderButtons()}
      </View>
    </ReusableModal>
  );
};

export default AssetHideConfirmation;
