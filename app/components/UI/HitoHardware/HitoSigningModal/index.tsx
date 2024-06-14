import React, { useState } from 'react';
import Modal from 'react-native-modal';
import { IHitoState } from '../types';
import { StyleSheet, View } from 'react-native';
import HitoSigningDetails from '../HitoSigningDetails';
import { useTheme } from '../../../../util/theme';
import { useDispatch, useSelector } from 'react-redux';
import { getNormalizedTxState } from '../../../../util/transactions';
import { resetTransaction } from '../../../../actions/transaction';

interface IHitoSigningModalProps {
  isVisible: boolean;
  HitoState: IHitoState;
  onSuccess?: () => void;
  onCancel?: () => void;
  onFailure?: (error: string) => void;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    contentWrapper: {
      justifyContent: 'flex-end',
      height: 600,
      backgroundColor: colors.background.default,
      paddingTop: 24,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
  });

const QRSigningModal = ({
  isVisible,
  HitoState,
  onSuccess,
  onCancel,
  onFailure,
}: IHitoSigningModalProps) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const styles = createStyles(colors);
  const [isModalCompleteShow, setModalCompleteShow] = useState(false);
  const { from } = useSelector(getNormalizedTxState);

  const handleCancel = () => {
    onCancel?.();
    dispatch(resetTransaction());
  };
  const handleSuccess = () => {
    onSuccess?.();
    dispatch(resetTransaction());
  };

  const handleFailure = (error: string) => {
    onFailure?.(error);
    dispatch(resetTransaction());
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.7}
      backdropColor={colors.overlay.default}
      animationInTiming={600}
      animationOutTiming={600}
      hideModalContentWhileAnimating
      onModalShow={() => {
        setModalCompleteShow(true);
      }}
      onModalHide={() => {
        setModalCompleteShow(false);
      }}
      propagateSwipe
    >
      <View style={styles.contentWrapper}>
        <HitoSigningDetails
          HitoState={HitoState}
          showCancelButton
          tighten
          showHint
          shouldStartAnimated={isModalCompleteShow}
          successCallback={handleSuccess}
          cancelCallback={handleCancel}
          failureCallback={handleFailure}
          bypassAndroidCameraAccessCheck={false}
          fromAddress={from}
        />
      </View>
    </Modal>
  );
};

export default QRSigningModal;
