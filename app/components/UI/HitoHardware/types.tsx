export interface IHitoState {
  sync: {
    reading: boolean;
  };
  sign: {
    request?: {
      requestId: string;
      payload: {
        cbor: string;
        type: string;
      };
    };
  };
}
