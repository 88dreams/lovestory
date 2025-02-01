import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

type NetInfoStateBase = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
};

export type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
};

export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    // Initial network state check
    NetInfo.fetch().then((state: NetInfoStateBase) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoStateBase) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
}; 