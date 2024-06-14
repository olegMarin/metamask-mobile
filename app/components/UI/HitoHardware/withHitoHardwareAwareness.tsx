import React, { useState, useEffect, ComponentClass } from 'react';
import Engine from '../../../core/Engine';
import { IHitoState } from './types';

const withHitoHardwareAwareness = (
  Children: ComponentClass<{
    HitoState?: IHitoState;
    isSigningHitoObject?: boolean;
    isSyncingHitoHardware?: boolean;
  }>,
) => {
  const HitoHardwareAwareness = (props: any) => {
    const [HitoState, SetHitoState] = useState<IHitoState>({
      sync: {
        reading: false,
      },
      sign: {},
    });

    const subscribeKeyringState = (value: any) => {
      SetHitoState(value);
    };

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
    }, []);

    return (
      <Children
        {...props}
        isSigningHitoObject={!!HitoState.sign?.request}
        isSyncingHitoHardware={HitoState.sync.reading}
        HitoState={HitoState}
      />
    );
  };

  return HitoHardwareAwareness;
};

export default withHitoHardwareAwareness;
